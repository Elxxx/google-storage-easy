import { Storage, UploadOptions } from '@google-cloud/storage';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  DownloadParams,
  DownloadResult,
  GcsClientOptions,
  GetParams,
  ListParams,
  ListedObject,
  MetadataResult,
  UploadParams,
  UploadResult,
} from './types';
import { GcsEasyError, InvalidUploadSourceError, MissingBucketError } from './errors';

/**
 * Cliente amigable para Google Cloud Storage.
 *
 * Autenticación:
 * - Application Default Credentials (Workload Identity en GKE, GCE, Cloud Run, etc.)
 * - GOOGLE_APPLICATION_CREDENTIALS con keyfile JSON
 * - keyFilename / credentials en opciones
 */
export class GcsClient {
  private storage: Storage;
  private defaultBucket?: string;

  constructor(options: GcsClientOptions = {}) {
    const { projectId, defaultBucket, keyFilename, credentials } = options;

    this.storage = new Storage({
      projectId,
      keyFilename,
      credentials,
      // Si no pasas nada, usa ADC automáticamente
    });

    this.defaultBucket = defaultBucket;
  }

  /** Obtiene un handler de bucket, usando el default si no se provee. */
  private bucketOrThrow(bucket?: string) {
    const name = bucket || this.defaultBucket;
    if (!name) throw new MissingBucketError();
    return this.storage.bucket(name);
  }

  /**
   * Sube un objeto al bucket.
   * - Puedes subir con `data` (Buffer|string) o `filePath` (ruta local).
   * - Soporta contentType, gzip, resumable, ACL pública y metadatos.
   */
  async upload(params: UploadParams): Promise<UploadResult> {
    const {
      bucket,
      destination,
      data,
      filePath,
      contentType,
      gzip = false,
      resumable = true,
      makePublic = false,
      metadata = {},
    } = params;

    if (!data && !filePath) throw new InvalidUploadSourceError();

    const b = this.bucketOrThrow(bucket);
    const file = b.file(destination);

    // Opciones comunes de subida
    const common: UploadOptions = {
      gzip,
      resumable,
      metadata: {
        contentType,
        metadata, // metadatos de usuario
      },
      // Nota: Si subes con file.save, estas opciones se mapean vía metadata
    };

    // Subida por buffer/string (memoria)
    if (data) {
      await file.save(
        typeof data === 'string' ? Buffer.from(data) : data,
        common
      );
    } else if (filePath) {
      // Subida por archivo local
      await b.upload(filePath, { destination, ...common });
    }

    if (makePublic) {
      await file.makePublic();
    }

    const [meta] = await file.getMetadata();
    return {
      bucket: b.name,
      key: destination,
      mediaLink: meta.mediaLink,
      etag: meta.etag,
    };
  }

  /**
   * Descarga un objeto. Si `destinationFilePath` se indica, guarda a disco.
   * Si no, devuelve un Buffer con el contenido.
   */
  async download(params: DownloadParams): Promise<DownloadResult> {
    const { bucket, source, destinationFilePath } = params;
    const b = this.bucketOrThrow(bucket);
    const file = b.file(source);

    if (destinationFilePath) {
      // Asegura directorio
      await fs.promises.mkdir(path.dirname(destinationFilePath), { recursive: true });
      await file.download({ destination: destinationFilePath });
      return { bucket: b.name, key: source, filePath: destinationFilePath };
    }

    const [buf] = await file.download();
    return { bucket: b.name, key: source, data: buf };
  }

  /**
   * Lista objetos con soporte de prefix, delimiter (simula carpetas),
   * pageSize y paginación automática (por defecto).
   */
  async list(params: ListParams = {}): Promise<ListedObject[]> {
    const {
      bucket,
      prefix,
      delimiter,
      pageSize,
      autoPaginate = true,
    } = params;

    const b = this.bucketOrThrow(bucket);

    const [files] = await b.getFiles({
      prefix,
      delimiter,
      maxResults: pageSize,
      autoPaginate,
    });

    // Normaliza metadatos básicos
    return (await Promise.all(
      files.map(async (f) => {
        const [meta] = await f.getMetadata();
        return {
          name: f.name,
          size: meta.size,
          contentType: meta.contentType,
          updated: meta.updated,
          etag: meta.etag,
        } as ListedObject;
      })
    ));
  }

  /**
   * Devuelve el contenido de un objeto como Buffer (útil para pipes HTTP).
   */
  async getBuffer(params: GetParams): Promise<Buffer> {
    const { bucket, key } = params;
    const b = this.bucketOrThrow(bucket);
    const file = b.file(key);
    const [buf] = await file.download();
    return buf;
  }

  /**
   * Obtiene metadatos completos del objeto.
   */
  async getMetadata(params: GetParams): Promise<MetadataResult> {
    const { bucket, key } = params;
    const b = this.bucketOrThrow(bucket);
    const file = b.file(key);
    const [meta] = await file.getMetadata();

    return {
      bucket: b.name,
      key,
      metadata: meta,
    };
  }
}

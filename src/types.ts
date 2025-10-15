export interface GcsClientOptions {
  /** ID del proyecto (opcional si usas ADC/Workload Identity). */
  projectId?: string;
  /** Nombre de bucket por defecto (puedes sobrescribir por método). */
  defaultBucket?: string;
  /** Ruta al keyfile JSON o contenido de credenciales (opcional si ADC). */
  keyFilename?: string;
  /** Credenciales inline (service account), alternativa a keyFilename. */
  credentials?: {
    client_email?: string;
    private_key?: string;
  };
}

export interface UploadParams {
  bucket?: string;
  /** Ruta (key) destino dentro del bucket, ej: 'carpeta/archivo.pdf' */
  destination: string;
  /** Opcional: contenido directo como Buffer o string. */
  data?: Buffer | string;
  /** Opcional: path local a archivo para subir (si no usas 'data'). */
  filePath?: string;
  /** Establece content-type (ej: 'application/pdf', 'image/png'). */
  contentType?: string;
  /** Activa gzip (útil para textos/json). */
  gzip?: boolean;
  /** Subida reanudable (recomendado para archivos grandes). */
  resumable?: boolean;
  /** Si true, pone el objeto como public-read al terminar. */
  makePublic?: boolean;
  /** Metadatos adicionales a agregar al objeto. */
  metadata?: Record<string, any>;
}

export interface DownloadParams {
  bucket?: string;
  /** Key origen dentro del bucket. */
  source: string;
  /** Si se indica, guarda a disco; si no, devuelve Buffer. */
  destinationFilePath?: string;
}

export interface ListParams {
  bucket?: string;
  /** Prefijo para listar (simula carpeta), ej: 'carpeta/sub/'. */
  prefix?: string;
  /** Si se indica, delimita como 'carpetas' (usualmente '/'). */
  delimiter?: string;
  /** Tamaño de página; si no, autopaginado. */
  pageSize?: number;
  /** Si false, solo una página. Por defecto true (todas). */
  autoPaginate?: boolean;
}

export interface GetParams {
  bucket?: string;
  /** Key del objeto a obtener. */
  key: string;
}

export interface ListedObject {
  name: string;
  size?: string;
  contentType?: string;
  updated?: string;
  etag?: string;
}

export interface UploadResult {
  bucket: string;
  key: string;
  mediaLink?: string;
  etag?: string;
}

export interface DownloadResult {
  bucket: string;
  key: string;
  /** Si no hubo destino en disco, aquí viene el Buffer. */
  data?: Buffer;
  /** Si se guardó en disco, ruta del archivo local. */
  filePath?: string;
}

export interface MetadataResult {
  bucket: string;
  key: string;
  metadata: Record<string, any>;
}

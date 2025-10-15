import { Injectable } from '@nestjs/common';
import { GcsClient } from '../gcs-client';
import { DownloadParams, GetParams, ListParams, UploadParams } from '../types';

@Injectable()
export class GcsService {
  constructor(private readonly client: GcsClient) {}

  upload(params: UploadParams) {
    return this.client.upload(params);
  }

  download(params: DownloadParams) {
    return this.client.download(params);
  }

  list(params?: ListParams) {
    return this.client.list(params);
  }

  getBuffer(params: GetParams) {
    return this.client.getBuffer(params);
  }

  getMetadata(params: GetParams) {
    return this.client.getMetadata(params);
  }
}

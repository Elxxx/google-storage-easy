import { DynamicModule, Module } from '@nestjs/common';
import { GcsService } from './gcs.service';
import { GcsClient } from '../gcs-client';
import { GcsClientOptions } from '../types';

export const GCS_CLIENT = Symbol('GCS_CLIENT');

@Module({})
export class GcsModule {
  static forRoot(options: GcsClientOptions = {}): DynamicModule {
    return {
      module: GcsModule,
      providers: [
        {
          provide: GCS_CLIENT,
          useFactory: () => new GcsClient(options),
        },
        {
          provide: GcsService,
          useFactory: (client: GcsClient) => new GcsService(client),
          inject: [GCS_CLIENT],
        },
      ],
      exports: [GCS_CLIENT, GcsService],
    };
  }
}

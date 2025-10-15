export class GcsEasyError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'GcsEasyError';
  }
}

export class MissingBucketError extends GcsEasyError {
  constructor() {
    super('No se especificó bucket. Define defaultBucket en el cliente o pásalo por método.');
    this.name = 'MissingBucketError';
  }
}

export class InvalidUploadSourceError extends GcsEasyError {
  constructor() {
    super('Debes proveer "data" (Buffer|string) o "filePath" para subir.');
    this.name = 'InvalidUploadSourceError';
  }
}

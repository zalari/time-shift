import {
  StoreRequestCredentialsS3,
  StoreRequestPayloadS3,
  StoreRequestS3,
} from '@/functions/store/s3';

export type StoreRequest = StoreRequestBase | StoreRequestS3;

export type StoreRequestCredentials = StoreRequestCredentialsS3;

export interface StoreRequestBase {
  type: StorageTypes;
  credentials: StoreRequestCredentials;
  payload: StoreRequestPayload;
}

export type StoreRequestPayload = StoreRequestPayloadS3;

export enum StorageTypes {
  S3 = 's3',
}

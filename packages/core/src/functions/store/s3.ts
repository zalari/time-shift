import { HandlerResponse } from '@netlify/functions';
import { S3 } from '@aws-sdk/client-s3';
import { StoreRequestBase } from '@/functions/store/types';
export const handleS3 = async (storeRequest: StoreRequestS3): Promise<HandlerResponse> => {
  // TODO: Use encryption or find a nice way to configure this here
  const s3 = new S3({
    credentials: {
      accessKeyId: storeRequest.credentials.accessKeyId,
      secretAccessKey: storeRequest.credentials.secretAccessKey,
    },
  });

  switch (storeRequest.payload.method) {
    case HttpMethod.Get: {
      const { Body } = await s3.getObject({
        Bucket: storeRequest.credentials.bucket,
        Key: storeRequest.payload.key,
      });

      return { statusCode: 200, body: Body!.toString() };
    }
    case HttpMethod.Put:
      await s3.putObject({
        Bucket: storeRequest.credentials.bucket,
        Key: storeRequest.payload.key,
        Body: JSON.stringify(storeRequest.payload.data, null, 2),
      });
      return { statusCode: 200 };
    case HttpMethod.Delete:
      await s3.deleteObject({
        Bucket: storeRequest.credentials.bucket,
        Key: storeRequest.payload.key,
      });
      return { statusCode: 200 };
    default:
      return { statusCode: 400, body: 'Invalid' };
  }
};

export interface StoreRequestS3 extends StoreRequestBase {
  credentials: StoreRequestCredentialsS3;
  payload: StoreRequestPayloadS3;
}

export interface StoreRequestCredentialsS3 {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

export interface StoreRequestPayloadS3 {
  method: HttpMethod;
  key: string;
  data?: Record<string, unknown>;
}

export enum HttpMethod {
  Get = 'get',
  Put = 'put',
  Delete = 'delete',
}

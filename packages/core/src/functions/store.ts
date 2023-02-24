import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { StorageTypes, StoreRequest } from '@/functions/store/types';
import { handleS3, StoreRequestS3 } from '@/functions/store/s3';

const handler: Handler = async ({
  body,
  httpMethod,
  queryStringParameters,
}: HandlerEvent): Promise<HandlerResponse> => {
  if (httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  if (!(queryStringParameters && queryStringParameters.type)) {
    return {
      statusCode: 400,
      body: 'Missing "type" query parameter',
    };
  }

  if (queryStringParameters.type !== StorageTypes.S3) {
    return {
      statusCode: 400,
      body: 'Invalid "type" query parameter',
    };
  }

  if (!body) {
    return {
      statusCode: 400,
      body: 'Missing request body',
    };
  }

  const storageRequest = JSON.parse(body) as StoreRequest;

  switch (queryStringParameters.type) {
    case StorageTypes.S3:
      return await handleS3(storageRequest as StoreRequestS3);
  }

  return {
    statusCode: 200,
  };
};

export { handler };

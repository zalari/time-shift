import { Query } from '@/data/query.data';
import { Repository } from '@/data/repository.interface';
import { Connection } from './connection.data';
import { getConfig } from '@/utils/config.utils';
import { HttpMethod, StoreRequestPayloadS3, StoreRequestS3 } from '@/functions/store/s3';
import { StorageTypes } from '@/functions/store/types';

interface RepositoryS3TimeShiftFile {
  connections: Connection[];
  queries: Query[];
}

export class RepositoryS3 implements Repository {
  async createConnection(connection: Omit<Connection, 'id'>): Promise<Connection['id']> {
    const file = await this.getJsonFile();
    const newId = Math.max(...file.connections.map(c => c.id), 0) + 1;
    const connectionToCreate: Connection = { ...connection, id: newId };
    file.connections.push(connectionToCreate);
    await this.put(file);
    return newId;
  }

  async createQuery(query: Omit<Query, 'id'>): Promise<Query['id']> {
    const file = await this.getJsonFile();
    const newId = Math.max(...file.queries.map(c => c.id), 0) + 1;
    const queryToCreate: Query = { ...query, id: newId };
    file.queries.push(queryToCreate);
    await this.put(file);
    return newId;
  }

  async deleteConnection(id: number): Promise<boolean> {
    const file = await this.getJsonFile();
    file.connections = file.connections.filter(c => c.id !== id);
    await this.put(file);
    return true;
  }

  async deleteQuery(id: number): Promise<boolean> {
    const file = await this.getJsonFile();
    file.queries = file.queries.filter(c => c.id !== id);
    await this.put(file);
    return true;
  }

  async getConnection(id: number): Promise<Connection | undefined> {
    const file = await this.getJsonFile();
    return file.connections.find(c => c.id === id);
  }

  async getConnections(): Promise<Connection[]> {
    const file = await this.getJsonFile();
    return file.connections;
  }

  async getQueries(): Promise<Query[]> {
    const file = await this.getJsonFile();
    return file.queries;
  }

  async getQuery(id: number): Promise<Query | undefined> {
    const file = await this.getJsonFile();
    return file.queries.find(c => c.id === id);
  }

  async updateConnection(connection: Connection): Promise<Connection['id']> {
    const file = await this.getJsonFile();
    file.connections = file.connections.map(c => (c.id === connection.id ? connection : c));
    await this.put(file);
    return connection.id;
  }

  async updateQuery(query: Query): Promise<Query['id']> {
    const file = await this.getJsonFile();
    file.queries = file.queries.map(q => (q.id === query.id ? query : q));
    await this.put(file);
    return query.id;
  }

  private async getJsonFile(): Promise<RepositoryS3TimeShiftFile> {
    const response = await this.callStoreProxy({
      method: HttpMethod.Get,
    });

    return (await response.json()) as RepositoryS3TimeShiftFile;
  }

  private async put(data: RepositoryS3TimeShiftFile): Promise<Response> {
    return this.callStoreProxy({
      method: HttpMethod.Put,
      ...data,
    });
  }

  private async callStoreProxy(
    storeRequest: Omit<StoreRequestPayloadS3, 'key'>,
  ): Promise<Response> {
    const config = await getConfig();
    if (config.s3 === undefined) {
      throw new Error('S3 config not found');
    }

    const baseUrl = config.urls.storeProxy;
    const accessKeyId = config.s3.accessKeyId;
    const secretAccessKey = config.s3.secretAccessKey;
    const bucket = config.s3.bucket;
    const key = config.s3.key;

    const storeRequestS3: StoreRequestS3 = {
      type: StorageTypes.S3,
      // TODO: Either encrypt this or find a nice way to configure this in the store-function
      credentials: {
        accessKeyId,
        secretAccessKey,
        bucket,
      },
      payload: {
        key,
        method: storeRequest.method,
        data: storeRequest.data,
      },
    };

    return fetch(`${baseUrl}&type=s3`, {
      method: 'POST',
      body: JSON.stringify(storeRequestS3),
    });
  }
}

import { IndexDbClient } from '@/utils/database.utils';
import { Query } from '@/data/query.data';
import { Repository } from '@/data/repository.interface';
import { Connection } from './connection.data';

export class RepositoryIndexDb implements Repository {
  async createConnection(connection: Omit<Connection, 'id'>): Promise<number> {
    const db = await IndexDbClient.connect();
    const id = await db.add('connections', connection as Connection);
    db.close();

    return id as unknown as Connection['id'];
  }
  async getConnection(id: number): Promise<Connection | undefined> {
    const db = await IndexDbClient.connect();
    return db.get('connections', id as any) as Promise<Connection | undefined>;
  }

  async getConnections(): Promise<Connection[]> {
    const db = await IndexDbClient.connect();
    return db.getAll('connections') as Promise<Connection[]>;
  }

  async deleteConnection(id: number): Promise<boolean> {
    const db = await IndexDbClient.connect();
    await db.delete('connections', id as any);
    db.close();

    return true;
  }
  async updateConnection(connection: Connection): Promise<number> {
    const db = await IndexDbClient.connect();
    const id = await db.put('connections', connection);
    db.close();

    return id as unknown as Connection['id'];
  }

  async createQuery(query: Omit<Query, 'id'>): Promise<Query['id']> {
    const db = await IndexDbClient.connect();
    const id = await db.add('queries', query as Query);
    db.close();

    return id as unknown as Query['id'];
  }

  async deleteQuery(id: number): Promise<boolean> {
    const db = await IndexDbClient.connect();
    await db.delete('queries', id as any);
    db.close();

    return true;
  }

  async getQueries(): Promise<Query[]> {
    const db = await IndexDbClient.connect();
    return db.getAll('queries') as Promise<Query[]>;
  }

  async getQuery(id: number): Promise<Query | undefined> {
    const db = await IndexDbClient.connect();
    return db.get('queries', id as any) as Promise<Query | undefined>;
  }

  async updateQuery(query: Query): Promise<Query['id']> {
    const db = await IndexDbClient.connect();
    const id = await db.put('queries', query);
    db.close();

    return id as unknown as Query['id'];
  }
}

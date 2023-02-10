import { Query } from '@/data/query.data';
import { Connection } from '@/data/connection.data';

export interface Repository extends ConnectionRepository, QueryRepository {}

export interface ConnectionRepository {
  createConnection(connection: Omit<Connection, 'id'>): Promise<Connection['id']>;
  getConnection(id: number): Promise<Connection | undefined>;
  getConnections(): Promise<Connection[]>;
  deleteConnection(id: number): Promise<boolean>;
  updateConnection(connection: Connection): Promise<Connection['id']>;
}

export interface QueryRepository {
  createQuery(query: Omit<Query, 'id'>): Promise<Query['id']>;
  deleteQuery(id: number): Promise<boolean>;
  getQueries(): Promise<Query[]>;
  getQuery(id: number): Promise<Query | undefined>;
  updateQuery(query: Query): Promise<Query['id']>;
}

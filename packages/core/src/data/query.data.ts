import type { AdapterQueryFields, AdapterQueryValues } from '@time-shift/common';

import { Database } from '../utils/database.utils';
import type { Connection } from './connection.data';

declare global {
  namespace TimeShiftDB {
    interface Schema {
      queries: {
        indexes: { id: number };
        key: string;
        value: Query;
      };
    }
    interface EventMap {
      'queries:changed': () => void;
      'query:created': () => void;
      'query:updated': () => void;
      'query:deleted': () => void;
    }
  }
}

export type Query = {
  id: number;
  name: string;
  source: Connection['id'];
  filters: AdapterQueryValues<AdapterQueryFields>;
};

export const getAllQuerys = async (): Promise<Query[]> => {
  const db = await Database.connect();
  return db.getAll('queries') as Promise<Query[]>;
};

export const getQuery = async (id: number): Promise<Query | undefined> => {
  const db = await Database.connect();
  return db.get('queries', id as any) as Promise<Query | undefined>;
};

export const createQuery = async (value: Omit<Query, 'id'>): Promise<Query['id']> => {
  const db = await Database.connect();
  const id = await db.add('queries', value as Query);
  db.close();
  
  Database.Event.dispatch('queries:changed', 'query:created');
  return id as unknown as Query['id'];
};

export const updateQuery = async (value: Query): Promise<Query['id']> => {
  const db = await Database.connect();
  const id =await db.put('queries', value);
  db.close();

  Database.Event.dispatch('queries:changed', 'query:updated');
  return id as unknown as Query['id'];
};

export const deleteQuery = async (id: number): Promise<void> => {
  const db = await Database.connect();
  await db.delete('queries', id as any);
  db.close();

  Database.Event.dispatch('queries:changed', 'query:deleted');
};

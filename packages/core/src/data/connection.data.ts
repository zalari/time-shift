import type { AdapterConfigFields, AdapterConfigValues } from '@time-shift/common';
import { Database } from '../utils/database.utils';

declare global {
  namespace TimeShiftDB {
    interface Schema {
      connections: {
        indexes: { id: number };
        key: string;
        value: Connection;
      };
    }
    interface EventMap {
      'connections:changed': () => void;
      'connection:created': () => void;
      'connection:updated': () => void;
      'connection:deleted': () => void;
    }
  }
}

export type Connection = {
  id: number;
  name: string;
  type: string;
  config: AdapterConfigValues<AdapterConfigFields>;
};

export const getAllConnections = async (): Promise<Connection[]> => {
  const db = await Database.connect();
  return db.getAll('connections') as Promise<Connection[]>;
};

export const getConnection = async (id: number): Promise<Connection | undefined> => {
  const db = await Database.connect();
  return db.get('connections', id as any) as Promise<Connection | undefined>;
};

export const createConnection = async (
  value: Omit<Connection, 'id'>,
): Promise<Connection['id']> => {
  const db = await Database.connect();
  const id = await db.add('connections', value as Connection);
  db.close();

  Database.Event.dispatch('connections:changed', 'connection:created');
  return id as unknown as Connection['id'];
};

export const updateConnection = async (value: Connection): Promise<Connection['id']> => {
  const db = await Database.connect();
  const id = await db.put('connections', value);
  db.close();

  Database.Event.dispatch('connections:changed', 'connection:updated');
  return id as unknown as Connection['id'];
};

export const deleteConnection = async (id: number): Promise<void> => {
  const db = await Database.connect();
  await db.delete('connections', id as any);
  db.close();

  Database.Event.dispatch('connections:changed', 'connection:deleted');
};

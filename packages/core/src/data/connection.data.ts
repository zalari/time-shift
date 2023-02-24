import type { AdapterFields, AdapterValues } from '@time-shift/common';
import { getConnectionRepository } from '@/utils/database.utils';
import { dispatchEvent } from '@/utils/event.utils';

declare global {
  namespace Eventing {
    interface DomainEvents {
      'connections:changed': () => void;
      'connection:created': () => void;
      'connection:updated': () => void;
      'connection:deleted': () => void;
    }
  }
}

declare global {
  namespace TimeShiftDB {
    interface Schema {
      connections: {
        indexes: { id: number };
        key: string;
        value: Connection;
      };
    }
  }
}

export type Connection = {
  id: number;
  name: string;
  type: string;
  config: AdapterValues<AdapterFields>;
};

export const getAllConnections = async (): Promise<Connection[]> => {
  const repository = await getConnectionRepository();
  return repository.getConnections();
};

export const getConnection = async (id: number): Promise<Connection | undefined> => {
  const repository = await getConnectionRepository();
  return repository.getConnection(id);
};

export const createConnection = async (
  value: Omit<Connection, 'id'>,
): Promise<Connection['id']> => {
  const repository = await getConnectionRepository();
  const connection = repository.createConnection(value);
  dispatchEvent('connections:changed', 'connection:created');

  return connection;
};

export const updateConnection = async (value: Connection): Promise<Connection['id']> => {
  const repository = await getConnectionRepository();
  const id = repository.updateConnection(value);
  dispatchEvent('connections:changed', 'connection:updated');

  return id;
};

export const deleteConnection = async (id: number): Promise<void> => {
  const repository = await getConnectionRepository();
  await repository.deleteConnection(id);

  dispatchEvent('connections:changed', 'connection:deleted');
};

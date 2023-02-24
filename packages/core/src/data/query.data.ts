import type { AdapterFields, AdapterValues } from '@time-shift/common';
import type { Connection } from './connection.data';
import { getQueryRepository } from '@/utils/database.utils';
import { dispatchEvent } from '@/utils/event.utils';

declare global {
  namespace Eventing {
    interface DomainEvents {
      'queries:changed': () => void;
      'query:created': () => void;
      'query:updated': () => void;
      'query:deleted': () => void;
    }
  }
}

declare global {
  namespace TimeShiftDB {
    interface Schema {
      queries: {
        indexes: { id: number };
        key: string;
        value: Query;
      };
    }
  }
}

export type Query = {
  id: number;
  name: string;
  source: Connection['id'];
  target: Connection['id'];
  filters: AdapterValues<AdapterFields>;
  mapping: AdapterValues<AdapterFields>;
  strategy: AdapterValues<AdapterFields>;
};

export const getAllQuerys = async (): Promise<Query[]> => {
  const repository = await getQueryRepository();
  return repository.getQueries();
};

export const getQuery = async (id: number): Promise<Query | undefined> => {
  const repository = await getQueryRepository();
  return repository.getQuery(id);
};

export const createQuery = async (value: Omit<Query, 'id'>): Promise<Query['id']> => {
  const repository = await getQueryRepository();
  const query = repository.createQuery(value);
  dispatchEvent('queries:changed', 'query:created');

  return query;
};

export const updateQuery = async (value: Query): Promise<Query['id']> => {
  const repository = await getQueryRepository();
  const query = repository.updateQuery(value);
  dispatchEvent('queries:changed', 'query:updated');

  return query;
};

export const deleteQuery = async (id: number): Promise<void> => {
  const repository = await getQueryRepository();
  await repository.deleteQuery(id);
  dispatchEvent('queries:changed', 'query:deleted');
};

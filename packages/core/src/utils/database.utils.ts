import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

import { getConfig } from './config.utils';
import { ConnectionRepository, QueryRepository, Repository } from '@/data/repository.interface';
import { RepositoryIndexDb } from '@/data/repository-index-db.class';
import { RepositoryS3 } from '@/data/repository-s3.class';

/**
 * Ensure a valid initial state for the database
 */
export const setupDb = (): void => {
  // TODO: Switch based on configuration
  IndexDbClient.addTable('connections');
  IndexDbClient.addTable('queries');
};

/**
 * Factory method to retrieve a repository implementation based on the current configuration
 */
export const getRepository = async (): Promise<Repository> => {
  const config = await getConfig();

  if (config.s3) {
    return new RepositoryS3();
  }

  return new RepositoryIndexDb();
};

export const getConnectionRepository = async (): Promise<ConnectionRepository> => {
  return getRepository();
};

export const getQueryRepository = async (): Promise<QueryRepository> => {
  return getRepository();
};

// global declaration merging allows defining global
// event types in their respective modules
declare global {
  namespace TimeShiftDB {
    interface Schema extends DBSchema {}
  }
}

export namespace IndexDbClient {
  const slices = new Set<keyof TimeShiftDB.Schema>();

  export const addTable = (name: keyof TimeShiftDB.Schema) => {
    slices.add(name);
  };

  export const connect = async (): Promise<IDBPDatabase<TimeShiftDB.Schema>> => {
    const { database } = await getConfig();
    return openDB<TimeShiftDB.Schema>(database.name, 1, {
      upgrade(db) {
        slices.forEach(name => {
          if (!db.objectStoreNames.contains(name as any)) {
            db.createObjectStore(name as any, {
              keyPath: 'id',
              autoIncrement: true,
            });
          }
        });
      },
    });
  };
}

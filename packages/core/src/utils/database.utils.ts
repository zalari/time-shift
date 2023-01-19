import { type DBSchema, type IDBPDatabase, type OpenDBCallbacks, openDB } from 'idb';

import { getConfig } from './config.utils';

// global declaration merging allows defining global
// event types in their respective modules
declare global {
  namespace TimeShiftDB {
    interface Schema extends DBSchema {}
    interface EventMap {}
  }
}

export namespace Database {
  const slices = new Set<keyof TimeShiftDB.Schema>();

  export const addTable = (name: keyof TimeShiftDB.Schema) => {
    slices.add(name);
  };

  export const connect = async (): Promise<IDBPDatabase<TimeShiftDB.Schema>> => {
    const { database } = await getConfig();
    return openDB<TimeShiftDB.Schema>(database.name, 2, {
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

  // provide some event handling
  export namespace Event {
    const listeners = new Map<
      keyof TimeShiftDB.EventMap,
      Array<TimeShiftDB.EventMap[keyof TimeShiftDB.EventMap]>
    >();

    /**
     * Add a listener for a specific event
     * @param event
     * @param listener
     */
    export const addListener = <E extends keyof TimeShiftDB.EventMap>(
      event: E,
      listener: TimeShiftDB.EventMap[E],
    ) => {
      listeners.set(event, [...(listeners.get(event) || []), listener]);
    };

    /**
     * Remove a listener for a specific event
     * @param event
     * @param listener
     */
    export const removeListener = <E extends keyof TimeShiftDB.EventMap>(
      event: E,
      listener?: TimeShiftDB.EventMap[E],
    ) => {
      if (listener && listeners.has(event)) {
        const without = listeners.get(event)!.filter(l => l !== listener);
        listeners.set(event, without);
      } else {
        listeners.delete(event);
      }
    };

    /**
     * Dispatches an event of a given type
     * @param events
     */
    export const dispatch = (...events: Array<keyof TimeShiftDB.EventMap>) => {
      events.forEach(event => listeners.get(event)?.forEach((listener: () => void) => listener()));
    };
  }
}

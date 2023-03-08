import type { PreflightResult, TimeEntry } from '@time-shift/common';

export type MappedTimeEntries<P> = Map<string | undefined, Set<TimeEntry<P>>>;

/**
 * Adds a time entry to a given map.
 */
export const addTimeEntry = <P>(
  map: MappedTimeEntries<P>,
  key: string | undefined,
  timeEntry: TimeEntry<P>,
): MappedTimeEntries<P> => {
  const entries = map.get(key) ?? new Set();
  return map.set(key, entries.add(timeEntry));
};

/**
 * Searches a collection of time entries for notes containing given issue
 * keys and returns a map of issue keys to matching time entries.
 */
export const findTimeEntriesByPrefixes = <P>(
  timeEntries: TimeEntry<P>[],
  prefixes: string[],
  fallbackIssueKey?: string,
  field: 'note' | 'generated' = 'note',
): MappedTimeEntries<P> => {
  const expression = new RegExp(`(${prefixes.join('|')})\\d+`, 'gi');
  return timeEntries.reduce((map, timeEntry) => {
    // find any keys matching
    const matches = timeEntry[field]?.matchAll(expression) ?? [];
    const keys = new Set(Array.from(matches).map(([key]) => key));

    // non-matching
    if (keys.size === 0) {
      return addTimeEntry(map, fallbackIssueKey, timeEntry);
    }

    // divide the duration by the number of matched keys
    const entry = { ...timeEntry, minutes: timeEntry.minutes / keys.size };
    // add the entry to each key
    return Array.from(keys).reduce((map, key) => addTimeEntry(map, key, entry), map);
  }, new Map());
};

/**
 * In case of results that could not be mapped, we use this result for the time being
 */
export const getUnmappedResult = (sources: TimeEntry[]): PreflightResult => ({
  type: '1:1',
  result: sources.map(source => ({
    source,
    target: {
      action: 'none',
      entry: source,
    },
  })),
});
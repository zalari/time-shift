import type { PreflightResult, TimeEntry } from '@time-shift/common';

type MappedTimeEntries = Map<string | undefined, Set<TimeEntry>>;

/**
 * Adds a time entry to a given map.
 */
export const addTimeEntry = (
  map: MappedTimeEntries,
  key: string | undefined,
  timeEntry: TimeEntry,
): MappedTimeEntries => {
  const entries = map.get(key) ?? new Set();
  return map.set(key, entries.add(timeEntry));
};

/**
 * Searches a collection of time entries for notes containing given issue
 * keys and returns a map of issue keys to matching time entries.
 */
export const findWorklogIssuesByPrefixes = (
  timeEntries: TimeEntry[],
  prefixes: string[],
  field: 'note' | 'generated' = 'note',
): MappedTimeEntries => {
  const expression = new RegExp(`(${prefixes.join('|')})\\d+`, 'gi');
  return timeEntries.reduce((map, timeEntry) => {
    // find any keys matching
    const matches = timeEntry[field]?.matchAll(expression) ?? [];
    const keys = new Set(Array.from(matches).map(([key]) => key));

    // non-matching
    if (keys.size === 0) {
      return addTimeEntry(map, undefined, timeEntry);
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
export const getUnmappedResult = (timeEntries: TimeEntry[]): PreflightResult => ({
  type: '1:1',
  result: timeEntries.map(source => ({
    source,
    target: {
      action: 'none',
      entry: source,
    },
  })),
});

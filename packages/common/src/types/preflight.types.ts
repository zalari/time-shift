import type { TimeEntry } from './time-entry.types';

/**
 * A time entry with meta data decribing the sync action that should be performed.
 */
export type PreflightResultTimeEntry<R = {}> = {
  action: 'create' | 'update' | 'delete' | 'none';
  entry: TimeEntry<R>;
};

/**
 * Maps a given time entry to a single target.
 */
export type PreflightResultOneToOne<R, P = {}> = {
  source: TimeEntry<P>;
  target: PreflightResultTimeEntry<R>;
};

/**
 * Maps a given time entry to multiple targets.
 */
export type PreflightResultOneToMany<R, P = {}> = {
  source: TimeEntry<P>;
  targets: PreflightResultTimeEntry<R>[];
};

/**
 * Maps multiple time entries to a single target.
 */
export type PreflightResultManyToOne<R, P = {}> = {
  sources: TimeEntry<P>[];
  target: PreflightResultTimeEntry<R>;
};

/**
 * Results may be visualized in groups, e.g. grouped by days, projects or issues.
 */
export type GroupedPreflightResult<R = {}, P = {}> = Record<string, PlainPreflightResult<R, P>>;

/**
 * A preflight result is a list of time entries that are either mapped to a single target
 * or to multiple targets.
 */
export type PlainPreflightResult<R = {}, P = {}> =
  | { type: '1:1'; result: PreflightResultOneToOne<R, P>[] }
  | { type: '1:n'; result: PreflightResultOneToMany<R, P>[] }
  | { type: 'n:1'; result: PreflightResultManyToOne<R, P>[] };

/**
 * A preflight result may be grouped or not.
 */
export type PreflightResult<R = {}, P = {}> =
  | PlainPreflightResult<R, P>
  | GroupedPreflightResult<R, P>;

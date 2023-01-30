import { TimeEntry } from './time-entry.types';

export type PreflightResultOneToOne<R, P = {}> = {
  source: TimeEntry<P>;
  target: TimeEntry<R>;
};

export type PreflightResultOneToMany<R, P = {}> = {
  source: TimeEntry<P>;
  targets: TimeEntry<R>[];
};

export type PreflightResultManyToOne<R, P = {}> = {
  sources: TimeEntry<P>[];
  target: TimeEntry<R>;
};

export type PreflightResult<R = {}, P = {}> =
  | { type: '1:1'; result: PreflightResultOneToOne<R, P>[] }
  | { type: '1:n'; result: PreflightResultOneToMany<R, P>[] }
  | { type: 'n:1'; result: PreflightResultManyToOne<R, P>[] };

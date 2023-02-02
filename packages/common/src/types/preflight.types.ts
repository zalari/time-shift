import { TimeEntry } from './time-entry.types';

export type PreflightResultTimeEntry<R = {}> = {
  action: 'create' | 'update' | 'delete' | 'none';
  entry: TimeEntry<R>;
};

export type PreflightResultOneToOne<R, P = {}> = {
  source: TimeEntry<P>;
  target: PreflightResultTimeEntry<R>;
};

export type PreflightResultOneToMany<R, P = {}> = {
  source: TimeEntry<P>;
  targets: PreflightResultTimeEntry<R>[];
};

export type PreflightResultManyToOne<R, P = {}> = {
  sources: TimeEntry<P>[];
  target: PreflightResultTimeEntry<R>;
};

export type PreflightResult<R = {}, P = {}> =
  | { type: '1:1'; result: PreflightResultOneToOne<R, P>[] }
  | { type: '1:n'; result: PreflightResultOneToMany<R, P>[] }
  | { type: 'n:1'; result: PreflightResultManyToOne<R, P>[] };

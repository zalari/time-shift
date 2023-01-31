import type { AdapterFields, AdapterValues } from './field.types';
import type { PreflightResult } from './preflight.types';
import type { TimeEntry } from './time-entry.types';

/**
 * Time entry fields consist of multiple grouped fields.
 */
export type AdapterTimeEntryFields<
  QueryFields extends AdapterFields,
  NoteMappingFields extends AdapterFields,
> = {
  queryFields: QueryFields;
  noteMappingFields: NoteMappingFields;
};

/**
 * Describes an adapter instance with all its necessary members.
 */
export type Adapter<
  QueryFields extends AdapterFields,
  NoteMappingFields extends AdapterFields,
  StrategyFields extends AdapterFields,
  TimeEntryPayload extends {},
> = {
  /**
   * Used to test configurations.
   */
  checkConnection(): Promise<boolean>;

  /**
   * In order to configure the getTimeEntries method, the adapter must provide a list of query fields.
   * Additionally, time entries may contain generated notes. Generating notes is configured by note mapping fields.
   */
  getTimeEntryFields: (
    values?: Partial<AdapterValues<QueryFields>>,
  ) => Promise<AdapterTimeEntryFields<QueryFields, NoteMappingFields>>;

  /**
   * Get all time entries for a given date range.
   */
  getTimeEntries: (
    queryFields?: Partial<AdapterValues<QueryFields>>,
    noteMappingFields?: Partial<AdapterValues<NoteMappingFields>>,
  ) => Promise<TimeEntry<TimeEntryPayload>[]>;

  /**
   * In order to map time entries, the adapter must provide a list of strategy fields.
   */
  getStrategyFields: (sourceAdapter?: string) => Promise<StrategyFields>;

  /**
   * In order to do a sync operation, a preflight has to be done, mapping the source entris to some targets.
   * These preflight mappings consists of either a 1:1, 1:n, or 1:n mapping.
   */
  getPreflight: (
    sources: TimeEntry[],
    startegyFields?: Partial<AdapterValues<StrategyFields>>,
  ) => Promise<PreflightResult<TimeEntryPayload>>;
};

/**
 * Delivers an adapter instance for a given configuration.
 */
export type AdapterFactory<
  ConfigFields extends AdapterFields,
  QueryFields extends AdapterFields,
  NoteMappingFields extends AdapterFields,
  StrategyFields extends AdapterFields,
  TimeEntryPayload extends {},
> = (
  // for configuration, all options must be passed
  config: AdapterValues<ConfigFields>,
) => Promise<Adapter<QueryFields, NoteMappingFields, StrategyFields, TimeEntryPayload>>;

/**
 * Used in global scope to store adapters.
 */
export type AdapterSet<
  ConfigFields extends AdapterFields,
  QueryFields extends AdapterFields,
  NoteMappingFields extends AdapterFields,
  StrategyFields extends AdapterFields,
  TimeEntryPayload extends {},
> = {
  adapter: AdapterFactory<
    ConfigFields,
    QueryFields,
    NoteMappingFields,
    StrategyFields,
    TimeEntryPayload
  >;
  config: ConfigFields;
};

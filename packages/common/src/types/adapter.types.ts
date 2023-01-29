import type { AdapterFields, AdapterValues } from './field.types';
import type { TimeEntry } from './time-entry.types';

/**
 * Time entry fields consist of multiple grouped fields.
 */
export type AdapterTimeEntryFieldsResponse<
  QueryFields extends AdapterFields,
  NoteMappingFields extends AdapterFields,
> = {
  queryFields: QueryFields;
  noteMappingFields: NoteMappingFields;
};

/**
 * Describes an adapter instance with all its necessary members.
 */
export type Adapter<QueryFields extends AdapterFields, NoteMappingFields extends AdapterFields> = {
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
  ) => Promise<AdapterTimeEntryFieldsResponse<QueryFields, NoteMappingFields>>;

  /**
   * Get all time entries for a given date range.
   */
  getTimeEntries: (fields?: Partial<AdapterValues<QueryFields>>) => Promise<TimeEntry[]>;
};

/**
 * Delivers an adapter instance for a given configuration.
 */
export type AdapterFactory<
  ConfigFields extends AdapterFields,
  QueryFields extends AdapterFields,
  NoteMappingFields extends AdapterFields,
> = (
  // for configuration, all options must be passed
  config: AdapterValues<ConfigFields>,
) => Promise<Adapter<QueryFields, NoteMappingFields>>;

/**
 * Used in global scope to store adapters.
 */
export type AdapterSet<
  ConfigFields extends AdapterFields,
  QueryFields extends AdapterFields,
  NoteMappingFields extends AdapterFields,
> = {
  adapter: AdapterFactory<ConfigFields, QueryFields, NoteMappingFields>;
  config: ConfigFields;
};

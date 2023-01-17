import type {
  AvailableComparatorsMap,
  ComparableTypes,
  ComparisonValueMap,
} from './comparator.types';
import type { TimeEntry } from './time-entry.types';

/**
 * Common to all adapter fields.
 *
 * Basically, all configurable fields, either for configuring the connection or
 * for narrowing the results, consist of a label and an optional description.
 */
export type AdapterFieldCommon = {
  label: string;
  placeholder?: string;
  description?: string;
};

/**
 * A field of a given type with a preconfigured set of matchers.
 */
export type AdapterQueryField<T extends ComparableTypes> = AdapterFieldCommon &
  (
    | never
    // Configures a set of available matchers
    | {
        type: T;
        matchers: Array<AvailableComparatorsMap[T]>;
      }
    // Allows selecting one or multiple of preconfigured values
    | {
        type: T;
        multiple: boolean;
        values?: Array<ComparisonValueMap[T]>;
      }
  );

/**
 * Fields to narrow the adapter results.
 */
export type AdapterQueryFields = Record<string, AdapterQueryField<ComparableTypes>>;

/**
 * Values of an adapter, based on its configuration.
 */
export type AdapterQueryValues<L extends AdapterQueryFields> = {
  [K in keyof L]: ComparisonValueMap[L[K]['type']];
};

/**
 * Describes an adapter instance with all its necessary members.
 */
export type Adapter<ListFields extends AdapterQueryFields> = {
  /**
   * Used to test configurations.
   */
  checkConnection(): Promise<boolean>;

  /**
   * Get all time entries for a given date range.
   */
  getTimeEntries: (
    fields?: Partial<{
      [K in keyof ListFields]: {
        match: AvailableComparatorsMap[ListFields[K]['type']];
        value: ComparisonValueMap[ListFields[K]['type']];
      };
    }>,
  ) => Promise<TimeEntry[]>;
};

export type AdapterConfigFieldTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  url: string;
};

export type AdapterConfigField<T extends keyof AdapterConfigFieldTypeMap> = AdapterFieldCommon & {
  type: T;
};

/**
 * Config of an adapter instance.
 */
export type AdapterConfigFields = Record<
  string,
  AdapterConfigField<keyof AdapterConfigFieldTypeMap>
>;

/**
 * Values of an adapter, based on its configuration.
 */
export type AdapterConfigValues<C extends AdapterConfigFields> = {
  [K in keyof C]: AdapterConfigFieldTypeMap[C[K]['type']];
};

/**
 * All possible types of adapter fields.
 */
export type AdapterFieldType = keyof AdapterConfigFieldTypeMap | keyof ComparisonValueMap;
export type AdapterFieldTypeMap = AdapterConfigFieldTypeMap & ComparisonValueMap;
export type AdapterField =
  | AdapterConfigField<keyof AdapterConfigFieldTypeMap>
  | AdapterQueryField<ComparableTypes>;

/**
 * Delivers an adapter instance for a given configuration.
 */
export type AdapterFactory<C extends AdapterConfigFields, F extends AdapterQueryFields> = (
  config: AdapterConfigValues<C>,
) => Promise<Adapter<F>>;

/**
 * Used in global scope to store adapters.
 */
export type AdapterSet<C extends AdapterConfigFields, F extends AdapterQueryFields> = {
  adapter: AdapterFactory<C, F>;
  config: C;
  fields: F;
};

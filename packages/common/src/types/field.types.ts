/**
 * Common to all adapter fields.
 *
 * Basically, all configurable fields, either for configuring the connection or
 * for narrowing the results, consist of this common properties.
 */
export type AdapterFieldCommon = {
  /**
   * The label is shown above the input and must be set to clearly identify the field to the user.
   */
  label: string;
  /**
   * Is either shown as a placeholder or as a label for a checkbox field.
   */
  placeholder?: string;
  /**
   * Will be shown additionaly below the input.
   */
  description?: string;
  /**
   * Show this field conditionally depending on other fields (and their current values).
   */
  when?: Record<string, string | number | boolean>;
};

/**
 * Maps all primitive types to their type names.
 */
export type AdapterFieldTypeMap = {
  boolean: boolean;
  date: Date;
  number: number;

  // special string based types
  string: string;

  /**
   * Allows selecting one or multiple of preconfigured values.
   */
  select: string;

  /**
   * Shows an email input (with specific keyboards on mobile devices)
   */
  email: string;

  /**
   * Will be handled separatly to allow url manipulation.
   */
  url: string;

  /**
   * May allow obfuscation and toggling the input to be visible on request.
   */
  token: string;
};

/**
 * All available field type names.
 */
export type AdapterFieldType = keyof AdapterFieldTypeMap;

/**
 * A field of a given type.
 */
export type AdapterField<T extends AdapterFieldType> = AdapterFieldCommon &
  (T extends 'select'
    ? {
        type: T;
        multiple: boolean;
        values: {
          label: string;
          value: AdapterFieldTypeMap[T];
        }[];
      }
    : { type: T });

/**
 * Fields to narrow the adapter results.
 */
export type AdapterFields = Record<string, AdapterField<AdapterFieldType>>;

/**
 * Values of an adapter, based on its configuration.
 */
export type AdapterValues<C extends AdapterFields> = {
  [K in keyof C]: AdapterFieldTypeMap[C[K]['type']];
};

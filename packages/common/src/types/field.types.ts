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
export type AdapterField<K extends AdapterFieldType> = {
  /**
   * The type must be one of the declared ones in the map.
   */
  type: K;

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
   * Allows predefinition of available values.
   */
  options?: { label: string; value: AdapterFieldTypeMap[K] }[];

  /**
   * Let multiple values be selected.
   */
  multiple?: boolean;

  /**
   * Show this field conditionally depending on other fields (and their current values).
   */
  when?: Record<string, string | number | boolean>;
};

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

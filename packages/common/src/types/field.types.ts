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
 * Types predefined option values.
 */
export type AdapterFieldOptions<K extends AdapterFieldType> = {
  label: string;
  value: AdapterFieldTypeMap[K];
}[];

/**
 * A field of a given type.
 * We have to bend over backwards to get the type inference right.
 * @see https://stackoverflow.com/a/67198723/1146207
 */
export type AdapterField = AdapterFieldType extends infer K
  ? K extends AdapterFieldType
    ? {
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
        options?: AdapterFieldOptions<K>;

        /**
         * Let multiple values be selected.
         */
        multiple?: boolean;

        /**
         * Show this field conditionally depending on other fields (and their current values).
         */
        when?: Record<string, string | number | boolean>;
      }
    : never
  : never;

/**
 * Fields to narrow the adapter results.
 */
export type AdapterFields = Record<string, AdapterField>;

/**
 * Values of an adapter, based on its configuration.
 */
export type AdapterValues<C extends AdapterFields> = {
  [K in keyof C]: AdapterFieldTypeMap[C[K]['type']];
};

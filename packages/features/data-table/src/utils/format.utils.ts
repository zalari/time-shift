import type { Formatter, TableDataTypeMap } from '../types/table.types';

export const defaultFormatters = {
  bool: value => (value ? 'yes' : 'no'),
  string: value => value,
  number: value => value.toLocaleString(),
  date: value => value.toISOString(),
} satisfies {
  [key in keyof TableDataTypeMap]: Formatter<TableDataTypeMap[key]>;
};

export const getFormatterForType = <K extends keyof TableDataTypeMap>(
  type: K,
): Formatter<TableDataTypeMap[K]> => {
  return defaultFormatters[type] as Formatter<TableDataTypeMap[K]>;
};

export const formatValue = <K extends keyof TableDataTypeMap>(
  value: TableDataTypeMap[K],
  type: K,
): string | Element => {
  return getFormatterForType(type)(value);
};

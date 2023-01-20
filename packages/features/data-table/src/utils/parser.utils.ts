import type { Parser, TableDataTypeMap, TableDataTypes } from '../types/table.types';

export const defaultParsers = {
  bool: value => !!value,
  string: value => `${value}`,
  number: value => parseFloat(`${value}`),
  date: value => new Date(value as any),
} satisfies {
  [key in keyof TableDataTypeMap]: Parser<TableDataTypes, TableDataTypeMap[key]>;
};

export const getParserForType = <K extends keyof TableDataTypeMap>(
  type: K,
): Parser<TableDataTypes, TableDataTypeMap[K]> => {
  return defaultParsers[type] as Parser<TableDataTypes, TableDataTypeMap[K]>;
};

export const parseValue = (
  value: TableDataTypes,
  type: keyof TableDataTypeMap,
): TableDataTypeMap[typeof type] => {
  return getParserForType(type)(value);
};

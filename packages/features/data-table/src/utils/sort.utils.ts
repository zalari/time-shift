import type { Sorter, TableDataTypeMap } from '../types/table.types';

// prettier-ignore
export const defaultSorters = {
  bool({ cell: { value: { parsed: a } } }, { cell: { value: { parsed: b } } }, inverted) {
    return inverted
      ? (a === b)? 0 : a ? 1 : -1
      : (a === b) ? 0 : a ? -1 : 1
  },
  string({ cell: { value: { parsed: a } } }, { cell: { value: { parsed: b } } }, inverted)  {
    return inverted ? a.localeCompare(b) : b.localeCompare(a);
  },
  number({ cell: { value: { parsed: a } } }, { cell: { value: { parsed: b } } }, inverted) {
    return inverted ? a - b : b - a;
  },
  date({ cell: { value: { parsed: a } } }, { cell: { value: { parsed: b } } }, inverted) {
    return inverted ? +a - +b : +b - +a;
  },
} satisfies {
  [key in keyof TableDataTypeMap]: Sorter<TableDataTypeMap[key]>;
};

export const getSorterForType = (
  type: keyof TableDataTypeMap,
): Sorter<TableDataTypeMap[typeof type]> => {
  return defaultSorters[type] as Sorter<TableDataTypeMap[typeof type]>;
};

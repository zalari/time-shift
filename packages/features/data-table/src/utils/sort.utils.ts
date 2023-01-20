import type { Sorter, TableDataTypeMap } from '../types/table.types';

// prettier-ignore
export const defaultSorters = {
  bool({ cell: { value: { parsed: a } } }, { cell: { value: { parsed: b } } }, inverted) {
    return inverted
      ? (a === b) ? 0 : a ? -1 : 1
      : (a === b)? 0 : a ? 1 : -1;
  },
  string({ cell: { value: { parsed: a } } }, { cell: { value: { parsed: b } } }, inverted)  {
    return inverted ? b.localeCompare(a) : a.localeCompare(b);
  },
  number({ cell: { value: { parsed: a } } }, { cell: { value: { parsed: b } } }, inverted) {
    return inverted ? b - a : a - b;
  },
  date({ cell: { value: { parsed: a } } }, { cell: { value: { parsed: b } } }, inverted) {
    return inverted ? +b - +a : +a - +b;
  },
} satisfies {
  [key in keyof TableDataTypeMap]: Sorter<TableDataTypeMap[key]>;
};

export const getSorterForType = (
  type: keyof TableDataTypeMap,
): Sorter<TableDataTypeMap[typeof type]> => {
  return defaultSorters[type] as Sorter<TableDataTypeMap[typeof type]>;
};

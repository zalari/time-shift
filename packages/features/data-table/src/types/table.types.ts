export type TableDataTypeMap = {
  bool: boolean;
  string: string;
  number: number;
  date: Date;
};
export type TableDataTypes = TableDataTypeMap[keyof TableDataTypeMap];

export type TableSchemaEntry<T extends keyof TableDataTypeMap = any> = {
  column: string;
  name: string;
  type: T;

  sortable?: boolean;

  align?: 'left' | 'center' | 'right';
  multiline?: boolean;
  formatter?: Formatter<T>;
  parser?: Parser<T, TableDataTypeMap[T]>;
  sorter?: Sorter;
};

export type TableDataEntry = {
  [key: string]: TableDataTypes;
};

export type TableSchema = ReadonlyArray<TableSchemaEntry>;
export type TableData = ReadonlyArray<TableDataEntry>;

export type Header = Required<TableSchemaEntry>;
export type Value<T extends TableDataTypes = TableDataTypes> = {
  raw: TableDataTypes;
  parsed: T;
  formatted: string | Element;
};
export type Cell<T extends TableDataTypes = TableDataTypes> = {
  header: Header;
  value: Value<T>;
};
export type Column = { header: Header };
export type Row = { cells: Cell[] };

export type Formatter<T extends TableDataTypes> = (value: T) => string | Element;
export type FormatterMap = { [key in keyof TableDataTypeMap]: Formatter<TableDataTypeMap[key]> };
export type Parser<T, R extends TableDataTypes> = (value: T) => R;
export type Sorter<T extends TableDataTypes = TableDataTypes> = (
  a: { cell: Cell<T>; row: Row },
  b: { cell: Cell<T>; row: Row },
  inverted: boolean,
  column: string,
) => number;

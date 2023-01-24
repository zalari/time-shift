import _cloneDeep from 'lodash-es/cloneDeep';
import move from 'lodash-move';

import * as TableType from '../types/table.types';

import { getFormatterForType } from '../utils/format.utils';
import { getParserForType } from '../utils/parser.utils';
import { getSorterForType } from '../utils/sort.utils';

const _move = move.default;

export namespace HeadlessTable {
  export type Options = {
    sort?: {
      column: string;
      invert: boolean;
    };
    pagination?: {
      perPage: number;
      current?: number;
      pageCount?: number;
    };
  };

  export class Cell implements TableType.Cell {
    get value(): TableType.Value {
      return this._value;
    }

    get header(): TableType.Header {
      return this._header;
    }

    constructor(
      private readonly _header: TableType.Header,
      private readonly _value: TableType.Value,
    ) {}
  }

  export class Column implements TableType.Column {
    get header(): TableType.Header {
      return this._header;
    }

    constructor(private readonly _header: TableType.Header) {}
  }

  export class Row implements TableType.Row {
    private readonly _cellsByColumn = new Map<string, Cell>();

    get index(): number {
      return this._index;
    }

    get cells(): Cell[] {
      return this._cells;
    }

    constructor(private readonly _index: number, private readonly _cells: Cell[] = []) {
      _cells.forEach(cell => this.addCell(cell));
    }

    addCell(cell: Cell) {
      this._cells.push(cell);
      this._cellsByColumn.set(cell.header.column, cell);
    }

    getCell(column: string): Cell | undefined {
      return this._cellsByColumn.get(column);
    }
  }

  export class DataInternal {
    private readonly _headers: Readonly<Map<string, TableType.Header>>;

    private readonly _cells: ReadonlyArray<Cell>;

    private readonly _columns: ReadonlyArray<Column>;

    private readonly _rows: ReadonlyArray<Row>;

    private readonly _visibleRows: ReadonlyArray<Row>;

    constructor(
      private readonly _data: TableType.TableData,
      private readonly _schema: TableType.TableSchema,
      private readonly _options: Options = {},
    ) {
      const headers = new Map<string, TableType.Header>();
      const cells: Cell[] = [];
      const columns: Column[] = [];
      const rows: Row[] = [];

      this._schema.forEach(({ column, type, label, ...entry }, columnIndex) => {
        const align = entry.align || 'left';
        const sortable = entry.sortable ?? false;
        const multiline = entry.multiline ?? false;
        const formatter = entry.formatter ?? getFormatterForType(type);
        const parser = entry.parser ?? getParserForType(type);
        const sorter = entry.sorter ?? getSorterForType(type);
        const header = {
          // basic meta data
          align,
          column,
          multiline,
          label,
          type,
          sortable,
          // callbacks
          formatter,
          parser,
          sorter,
        } satisfies TableType.Header;

        headers.set(column, header);

        this._data.forEach((entry, rowIndex) => {
          const raw = entry[column];
          const parsed = parser(raw);
          const formatted = formatter(parsed, rowIndex);
          const value: TableType.Value = { raw, formatted, parsed };
          const cell = new Cell(header, value);

          // add to cells
          cells.push(cell);

          // (prepare and) add to column
          if (columns[columnIndex] === undefined) {
            columns[columnIndex] = new Column(header);
          }

          // (prepare and) add to row
          if (rows[rowIndex] === undefined) {
            rows[rowIndex] = new Row(rowIndex);
          }
          rows[rowIndex].addCell(cell);
        });
      });

      // derive visible rows from pagination
      // no pagination required, deliver all rows
      let visibleRows = rows;

      // prepare pagination from given options
      if (this._options.pagination !== undefined) {
        // set first page as current by default
        if (this._options.pagination.current === undefined) {
          this._options.pagination.current = 1;
        }
        // calculate page count
        this._options.pagination.pageCount = Math.ceil(
          rows.length / this._options.pagination.perPage,
        );

        // apply pagination and deliver visible rows only
        const { current = 1, perPage } = this._options.pagination;
        const from = (current - 1) * perPage;
        const to = from + perPage;
        visibleRows = rows.slice(from, to);
      }

      // ❄❄❄ freeze the stuff ❄❄❄
      this._data = Object.freeze(this._data);
      this._schema = Object.freeze(this._schema);
      this._options = Object.freeze(this._options);

      this._headers = Object.freeze(headers);
      this._cells = Object.freeze(cells);
      this._columns = Object.freeze(columns);
      this._rows = Object.freeze(rows);
      this._visibleRows = Object.freeze(visibleRows);

      Object.freeze(this);
    }

    getCurrentSortColumn(): string | undefined {
      return this._options.sort?.column;
    }

    isCurrentSortInverted(): boolean | undefined {
      return this._options.sort?.invert;
    }

    getCurrentPage(): number | undefined {
      return this._options.pagination?.current;
    }

    getPageCount(): number | undefined {
      return this._options.pagination?.pageCount;
    }

    getPerPage(): number | undefined {
      return this._options.pagination?.perPage;
    }

    getHeaders(): ReadonlyArray<TableType.Header> {
      return Array.from(this._headers.values());
    }

    getCells(): ReadonlyArray<TableType.Cell> {
      return this._cells;
    }

    getColumns(): ReadonlyArray<Column> {
      return this._columns;
    }

    getRows(): ReadonlyArray<Row> {
      return this._rows;
    }

    getVisibleRows(): ReadonlyArray<Row> {
      return this._visibleRows;
    }

    getTotalRowCount(): number {
      return this._rows.length;
    }

    getVisibleRowCount(): number {
      return this._visibleRows.length;
    }

    // TODO: implement me!
    filterBy(): DataInternal {
      return this;
    }

    sortBy(column: string, invert?: boolean): DataInternal {
      // derive inverted state from given params
      if (invert === undefined) {
        if (this._options.sort?.column === column) {
          invert = !this._options.sort.invert;
        } else {
          invert = false;
        }
      }

      // prepare new options from given sort params
      const options = _cloneDeep(this._options);
      options.sort = { column, invert };

      // clone data and sort it
      const data = _cloneDeep(this._data as TableType.TableDataEntry[]);
      data.sort((a, b) => {
        const header = this._headers.get(options.sort!.column);
        const rowA = this._rows[data.indexOf(a)];
        const rowB = this._rows[data.indexOf(b)];
        return (
          header?.sorter(
            { row: rowA, cell: rowA.getCell(options.sort!.column)! },
            { row: rowB, cell: rowB.getCell(options.sort!.column)! },
            options.sort!.invert,
            options.sort!.column,
          ) ?? 0
        );
      });

      // deliver new data table structure
      return new DataInternal(data, this._schema, options);
    }

    turnPage(page: number): DataInternal {
      // prepare new options from pagination options
      const options = _cloneDeep(this._options);
      options.pagination = options.pagination ?? { perPage: 10 };
      options.pagination.current = page;

      // deliver new data table structure
      return new DataInternal(this._data, this._schema, options);
    }

    moveColumnByIndex(from: number, to: number): DataInternal {
      // clone data, move the column and deliver new data table structure
      const schema = _move(_cloneDeep(this._schema as TableType.TableSchemaEntry[]), from, to);
      return new DataInternal(this._data, schema, this._options);
    }

    moveColumnAfter(column: string, after: string): DataInternal {
      const fromIndex = this._schema.findIndex(entry => entry.column === column);
      let toIndex = this._schema.findIndex(entry => entry.column === after);
      if (fromIndex < toIndex) {
        --toIndex;
      }
      return this.moveColumnByIndex(fromIndex, toIndex);
    }

    moveColumnBefore(column: string, before: string): DataInternal {
      const fromIndex = this._schema.findIndex(entry => entry.column === column);
      let toIndex = this._schema.findIndex(entry => entry.column === before);
      if (fromIndex > toIndex) {
        ++toIndex;
      }
      return this.moveColumnByIndex(fromIndex, toIndex);
    }

    moveRowByIndex(from: number, to: number): DataInternal {
      // as we're basically touching the sort order, we have to reset
      // them by not passing them on to the new instance
      const options = _cloneDeep(this._options);
      delete options.sort;

      // clone data, move the row and deliver new data table structure
      const data = _move(_cloneDeep(this._data as TableType.TableDataEntry[]), from, to);
      return new DataInternal(data, this._schema, options);
    }

    moveRowAfter(row: Row, after: Row): DataInternal {
      const fromIndex = this._rows.indexOf(row);
      let toIndex = this._rows.indexOf(after);
      if (fromIndex < toIndex) {
        --toIndex;
      }
      return this.moveRowByIndex(fromIndex, toIndex);
    }

    moveRowBefore(row: Row, before: Row): DataInternal {
      const fromIndex = this._rows.indexOf(row);
      let toIndex = this._rows.indexOf(before);
      if (fromIndex > toIndex) {
        ++toIndex;
      }
      return this.moveRowByIndex(fromIndex, toIndex);
    }
  }
}

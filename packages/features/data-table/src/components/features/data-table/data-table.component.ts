import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, eventOptions, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import { ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';

import type { DropTarget } from '../../../types/draggable.types';
import type { Cell, Row, TableData, TableSchema } from '../../../types/table.types';

import { HeadlessTable } from '../../../libs/headless-table.lib';
import { destroyDraggableColumn, makeColumnDraggable } from '../../../utils/draggable-column.utils';
import { destroyDraggableRow, makeRowDraggable } from '../../../utils/draggable-row.utils';

// prettier-ignore
type Split<S extends string, D extends string> =
    string extends S ? string[] :
    S extends '' ? [] :
    S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S];

@customElement('time-shift-data-table')
export class DataTable extends LitElement {
  private readonly columnsByReference = new Map<HTMLElement, string>();

  private readonly rowsByReference = new Map<HTMLElement, HeadlessTable.Row>();

  @state()
  data?: HeadlessTable.DataInternal;

  @state()
  draggedColumn?: string;

  @state()
  droppedColumn?: DropTarget<string>;

  @state()
  draggedRow?: HeadlessTable.Row;

  @state()
  droppedRow?: DropTarget<HeadlessTable.Row>;

  @property({ reflect: true, type: Number, attribute: 'items-per-page' })
  itemsPerPage = 10;

  @property({ reflect: true, type: Number, attribute: 'current-page' })
  currentPage = 1;

  @property({ reflect: true, type: Boolean, attribute: 'draggable-columns' })
  draggableColumns = false;

  @property({ reflect: true, type: Boolean, attribute: 'draggable-rows' })
  draggableRows = false;

  // @Event()
  // filtered!: EventEmitter<{ ? }>;

  emitSortedEvent(detail: { column: string; inverted: boolean }) {
    this.dispatchEvent(new CustomEvent('time-shift-data-table:sorted', { detail }));
  }

  emitTurnedEvent(detail: { currentPage: number; pageCount: number; perPage: number }) {
    this.dispatchEvent(new CustomEvent('time-shift-data-table:turned', { detail }));
  }

  emitDraggingEvent(detail: boolean) {
    this.dispatchEvent(new CustomEvent('time-shift-data-table:dragging', { detail }));
  }

  emitColumnDraggedEvent(detail: string) {
    this.dispatchEvent(new CustomEvent('time-shift-data-table:column-dragged', { detail }));
  }

  emitRowDraggedEvent(detail: HeadlessTable.Row) {
    this.dispatchEvent(new CustomEvent('time-shift-data-table:row-dragged', { detail }));
  }

  emitCellClickedEvent(detail: {
    cell: Cell;
    ref: HTMLElementTagNameMap['time-shift-table-cell'];
  }) {
    this.dispatchEvent(new CustomEvent('time-shift-data-table:cell-clicked', { detail }));
  }

  emitRowClickedEvent(detail: { row: Row; ref: HTMLElementTagNameMap['time-shift-table-row'] }) {
    this.dispatchEvent(new CustomEvent('time-shift-data-table:row-clicked', { detail }));
  }

  async setData(data: TableData, schema: TableSchema, options: HeadlessTable.Options = {}) {
    // set pagination
    if (this.itemsPerPage !== undefined && this.itemsPerPage > 0) {
      options.pagination = { perPage: this.itemsPerPage, current: this.currentPage };
    }

    // prepare data
    this.data = new HeadlessTable.DataInternal(data, schema, options);

    // set sorting if needed
    if (options.sort !== undefined) {
      const { column, invert } = options.sort;
      this.data = this.data.sortBy(column, invert);
    }
  }

  @eventOptions({ passive: true })
  handleTurnPage({ detail: page }: CustomEvent<number>) {
    this.data = this.data?.turnPage(page);
    this.emitTurnedEvent({
      currentPage: this.data?.getCurrentPage() ?? 0,
      pageCount: this.data?.getPageCount() ?? 0,
      perPage: this.data?.getPerPage() ?? 0,
    });
  }

  @eventOptions({ passive: true })
  handleCellClick(event: Event, cell: Cell) {
    const ref = event.currentTarget as HTMLElementTagNameMap['time-shift-table-cell'];
    this.emitCellClickedEvent({ cell, ref });
  }

  @eventOptions({ passive: true })
  handleRowClick(event: Event, row: Row) {
    const ref = event.currentTarget as HTMLElementTagNameMap['time-shift-table-row'];
    this.emitRowClickedEvent({ row, ref });
  }

  sortByColumn(column: string) {
    this.data = this.data?.sortBy(column);
    const inverted = this.data?.isCurrentSortInverted() ?? false;
    this.emitSortedEvent({ column, inverted });
  }

  storeColumnByReference(ref: HTMLElement | undefined, column: string) {
    if (ref === undefined) return;
    // prevent multiple initializations
    if (this.columnsByReference.has(ref)) {
      this.columnsByReference.delete(ref);
    }

    // store the row internally
    this.columnsByReference.set(ref, column);

    // add drag and drop behavior
    if (this.draggableColumns) {
      this.initializeDraggableColumn(ref);
    }
  }

  storeRowByReference(ref: HTMLElement | undefined, row: HeadlessTable.Row) {
    if (ref === undefined) return;
    // prevent multiple initializations
    if (this.rowsByReference.has(ref)) {
      destroyDraggableRow(ref);
      this.rowsByReference.delete(ref);
    }

    // store the row internally
    this.rowsByReference.set(ref, row);

    // add drag and drop behavior
    if (this.draggableRows) {
      this.initializeDraggableRow(ref);
    }
  }

  initializeDraggableColumn(ref: HTMLElement) {
    makeColumnDraggable(
      ref,
      // drag has started
      dragged => {
        // set current row cells as 'dragging' and notify
        this.draggedColumn = this.columnsByReference.get(dragged);
        this.emitDraggingEvent(true);
      },
      // drag has stopped (drop it like it's hot!)
      // @ts-ignore
      (dragged, target) => {
        this.draggedColumn = undefined;
        this.droppedColumn = undefined;
        this.emitDraggingEvent(false);

        // move dragged row to new destination
        const column = this.columnsByReference.get(dragged);
        const after = this.columnsByReference.get(target.after!);
        const before = this.columnsByReference.get(target.before!);

        if (column !== undefined) {
          // move
          if (after !== undefined) {
            this.data = this.data?.moveColumnAfter(column, after);
          } else if (before !== undefined) {
            this.data = this.data?.moveColumnBefore(column, before);
          }
          // notify
          this.emitColumnDraggedEvent(column);
        }
      },
      // while dragging
      // TODO: we should debounce this stuff (or/and use requestAnimationFrame)
      (_, target) => {
        const after = this.columnsByReference.get(target.after!);
        const before = this.columnsByReference.get(target.before!);
        // check if we have to update to prevent unnecessary render calls
        if (after !== this.droppedColumn?.after || before !== this.droppedColumn?.before) {
          this.droppedColumn = { after, before };
        }
      },
    );
  }

  initializeDraggableRow(ref: HTMLElement) {
    makeRowDraggable(
      ref,
      // drag has started
      dragged => {
        // set current row cells as 'dragging' and notify
        this.draggedRow = this.rowsByReference.get(dragged);
        this.emitDraggingEvent(true);
      },
      // drag has stopped (drop it like it's hot!)
      (dragged, target) => {
        this.draggedRow = undefined;
        this.droppedRow = undefined;
        this.emitDraggingEvent(false);

        // move dragged row to new destination
        const row = this.rowsByReference.get(dragged);
        const after = this.rowsByReference.get(target.after!);
        const before = this.rowsByReference.get(target.before!);

        if (row !== undefined) {
          // move
          if (after !== undefined) {
            this.data = this.data?.moveRowAfter(row, after);
          } else if (before !== undefined) {
            this.data = this.data?.moveRowBefore(row, before);
          }
          // notify
          this.emitRowDraggedEvent(row);
        }
      },
      // while dragging
      // TODO: we should debounce this stuff (or/and use requestAnimationFrame)
      (_, target) => {
        const after = this.rowsByReference.get(target.after!);
        const before = this.rowsByReference.get(target.before!);
        // check if we have to update to prevent unnecessary render calls
        if (after !== this.droppedRow?.after || before !== this.droppedRow?.before) {
          this.droppedRow = { after, before };
        }
      },
    );
  }

  disconnectedCallback() {
    // remove listeners from columns and rows
    this.columnsByReference.forEach((_, ref) => destroyDraggableColumn(ref));
    this.rowsByReference.forEach((_, ref) => destroyDraggableRow(ref));

    // flush the stored references
    this.columnsByReference.clear();
    this.rowsByReference.clear();
  }

  getSortModeForColumn(column: string): 'asc' | 'desc' | undefined {
    if (this.data?.getCurrentSortColumn() !== column) {
      return undefined;
    }

    return this.data.isCurrentSortInverted() ? 'asc' : 'desc';
  }

  getDraggedOverForColumn(column: string): 'left' | 'right' | undefined {
    if (this.droppedColumn?.before === column) {
      return 'right';
    } else if (this.droppedColumn?.after === column) {
      return 'left';
    } else {
      return undefined;
    }
  }

  getDraggedOverForRow(row: HeadlessTable.Row): 'top' | 'bottom' | undefined {
    if (this.droppedRow?.before === row) {
      return 'bottom';
    } else if (this.droppedRow?.after === row) {
      return 'top';
    } else {
      return undefined;
    }
  }

  render() {
    return html` ${when(
      this.data !== undefined,
      () => html`
        <time-shift-table>
          <time-shift-table-header>
            ${map(
              this.data!.getColumns(),
              ({ header: { align, column, label, sortable, width } }) => html`
                <time-shift-table-header-cell
                  ?sortable="${sortable}"
                  ?draggable="${this.draggableColumns}"
                  ?dragging="${this.draggedColumn === column}"
                  dragged-over="${ifDefined(this.getDraggedOverForColumn(column))}"
                  alignment="${ifDefined(align)}"
                  sorted="${ifDefined(this.getSortModeForColumn(column))}"
                  style="${styleMap({
                    ['--time-shift-table-header-cell-width']:
                      width === 'auto' ? undefined : `${width}%`,
                  })}"
                  @click="${() => sortable && this.sortByColumn(column)}"
                  ${ref(columnRef =>
                    this.storeColumnByReference(columnRef as HTMLElement | undefined, column),
                  )}
                >
                  <slot name="header-cell-${column}">${label}</slot>
                </time-shift-table-header-cell>
              `,
            )}
          </time-shift-table-header>
          <time-shift-table-body>
            ${map(
              this.data!.getVisibleRows(),
              row => html`
                <time-shift-table-row
                  data-index="${row.index}"
                  ?draggable="${this.draggableRows}"
                  ?droppable-after="${this.draggableRows}"
                  ?droppable-before="${this.draggableRows}"
                  @click="${(event: Event) => this.handleRowClick(event, row)}"
                  ${ref(rowRef => this.storeRowByReference(rowRef as HTMLElement | undefined, row))}
                >
                  ${map(
                    row.cells,
                    cell => html`
                      <time-shift-table-cell
                        ?multiline="${cell.header.multiline}"
                        ?draggable="${this.draggableRows}"
                        ?dragging="${this.draggedRow === row ||
                        this.draggedColumn === cell.header.column}"
                        alignment="${ifDefined(cell.header.align)}"
                        dragged-over="${ifDefined(
                          this.getDraggedOverForRow(row) ||
                            this.getDraggedOverForColumn(cell.header.column),
                        )}"
                        @click="${(event: Event) => this.handleCellClick(event, cell)}"
                      >
                        <slot
                          name="row-${row.index}-cell-${cell.header.column}"
                          data-cell-value-formatted="${ifDefined(cell.value.formatted)}"
                        >
                          ${cell.value.formatted}
                        </slot>
                      </time-shift-table-cell>
                    `,
                  )}
                </time-shift-table-row>
              `,
            )}
          </time-shift-table-body>
        </time-shift-table>
        ${when(
          this.itemsPerPage !== undefined && this.itemsPerPage < this.data!.getTotalRowCount(),
          () => html`
            <time-shift-pagination
              current="${ifDefined(this.data!.getCurrentPage())}"
              count="${ifDefined(this.data!.getPageCount())}"
              @time-shift-pagination:turn-page="${this.handleTurnPage}"
            ></time-shift-pagination>
          `,
        )}
      `,
    )}`;
  }
}

declare global {
  interface ElementEventMap {
    'time-shift-data-table:sorted': CustomEvent<{
      column: string;
      inverted: boolean;
    }>;
    'time-shift-data-table:turned': CustomEvent<{
      currentPage: number;
      pageCount: number;
      perPage: number;
    }>;
    'time-shift-data-table:dragging': CustomEvent<boolean>;
    'time-shift-data-table:column-dragged': CustomEvent<string>;
    'time-shift-data-table:row-dragged': CustomEvent<HeadlessTable.Row>;
    'time-shift-data-table:cell-clicked': CustomEvent<{
      cell: Cell;
      ref: HTMLElementTagNameMap['time-shift-table-cell'];
    }>;
    'time-shift-data-table:row-clicked': CustomEvent<{
      row: Row;
      ref: HTMLElementTagNameMap['time-shift-table-row'];
    }>;
  }
  interface HTMLElementTagNameMap {
    'time-shift-data-table': DataTable;
  }
}

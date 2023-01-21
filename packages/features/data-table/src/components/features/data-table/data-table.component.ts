import { html, LitElement } from 'lit';
import { customElement, eventOptions, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';
import { when } from 'lit/directives/when.js';

import type { DropTarget } from '../../../types/draggable.types';
import type { TableData, TableSchema } from '../../../types/table.types';

import { HeadlessTable } from '../../../libs/table.lib';
import { destroyDraggableColumn, makeColumnDraggable } from '../../../utils/draggable-column.utils';
import { destroyDraggableRow, makeRowDraggable } from '../../../utils/draggable-row.utils';

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

  async setData(data: TableData, schema: TableSchema) {
    const options: HeadlessTable.Options = {};
    if (this.itemsPerPage !== undefined && this.itemsPerPage > 0) {
      options.pagination = { perPage: this.itemsPerPage };
    }
    this.data = new HeadlessTable.DataInternal(data, schema, options);
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

    return this.data.isCurrentSortInverted() ? 'desc' : 'asc';
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

  setCellContent(cell: HTMLElement | undefined, content: string | Element) {
    if (cell === undefined) return;
    if (content instanceof Element) {
      cell.appendChild(content);
    } else {
      cell.innerText = content;
    }
  }

  render() {
    return html` ${when(
      this.data !== undefined,
      () => html`
        <time-shift-table>
          <time-shift-table-header>
            ${this.data!.getColumns().map(
              ({ header: { align, column, name, sortable } }) => html`
                <time-shift-table-header-cell
                  align="${align}"
                  ?sortable="${sortable}"
                  sorted="${ifDefined(this.getSortModeForColumn(column))}"
                  ?draggable="${this.draggableColumns}"
                  ?dragging="${this.draggedColumn === column}"
                  dragged-over="${ifDefined(this.getDraggedOverForColumn(column))}"
                  @click="${() => sortable && this.sortByColumn(column)}"
                  ${ref(columnRef =>
                    this.storeColumnByReference(columnRef as HTMLElement | undefined, column),
                  )}
                >
                  ${name}
                </time-shift-table-header-cell>
              `,
            )}
          </time-shift-table-header>
          <time-shift-table-body>
            ${this.data!.getVisibleRows().map(
              row => html`
                <time-shift-table-row
                  ?draggable="${this.draggableRows}"
                  ?droppable-after="${this.draggableRows}"
                  ?droppable-before="${this.draggableRows}"
                  ${ref(rowRef => this.storeRowByReference(rowRef as HTMLElement | undefined, row))}
                >
                  ${row.cells.map(
                    ({ header: { align, column, multiline }, value: { formatted } }) => html`
                      <time-shift-table-cell
                        align="${align}"
                        ?multiline="${multiline}"
                        ?draggable="${this.draggableRows}"
                        ?dragging="${this.draggedRow === row || this.draggedColumn === column}"
                        dragged-over="${ifDefined(
                          this.getDraggedOverForRow(row) || this.getDraggedOverForColumn(column),
                        )}"
                        ${ref(cell =>
                          this.setCellContent(cell as HTMLElement | undefined, formatted),
                        )}
                      ></time-shift-table-cell>
                    `,
                  )}
                </time-shift-table-row>
              `,
            )}
          </time-shift-table-body>
        </time-shift-table>
        ${when(
          this.itemsPerPage !== undefined,
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
  }
  interface HTMLElementTagNameMap {
    'time-shift-data-table': DataTable;
  }
}
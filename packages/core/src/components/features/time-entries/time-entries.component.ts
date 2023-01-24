import type { TimeEntry } from '@time-shift/common';
import type { HeadlessTable, TableData, TableSchema } from '@time-shift/data-table';

import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import { ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';

import '@time-shift/data-table';
import styles from './time-entries.component.scss';

@customElement('time-shift-time-entries')
export class TimeEntries extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @query('[slot="header-cell-selected"] input')
  private selectAll!: HTMLInputElement;

  @state()
  private table?: HTMLElementTagNameMap['time-shift-data-table'];

  @state()
  private allRows: ReadonlyArray<HeadlessTable.Row> = [];

  @state()
  private selected = new Set<number>();

  @property({ type: String, reflect: true })
  locale: string = 'en';

  @property({ type: Array })
  entries: TimeEntry[] = [];

  readonly dateFormat = new Intl.DateTimeFormat(this.locale, { dateStyle: 'medium' });
  readonly timeFormat = new Intl.RelativeTimeFormat(this.locale, { style: 'short' });

  readonly schema: TableSchema = [
    {
      column: 'selected',
      label: 'Selected',
      type: 'bool',
    },
    {
      column: 'at',
      label: 'Date',
      type: 'date',
      sortable: true,
      formatter: this.dateFormat.format.bind(this),
    },
    {
      column: 'minutes',
      label: 'Minutes',
      type: 'number',
      sortable: true,
      formatter: this.formatMinutes.bind(this),
    },
    {
      column: 'note',
      label: 'Notes',
      type: 'string',
      multiline: true,
    },
  ];

  get allChecked(): boolean {
    return this.selected.size === this.allRows.length;
  }

  get visibleChecked(): boolean {
    const visible = this.table?.data!.getVisibleRows() ?? [];
    return visible.map(row => row.index).every(index => this.selected.has(index));
  }

  formatMinutes(minutes: number): string {
    return this.timeFormat
      .formatToParts(minutes, 'minutes')
      .filter((_, index) => index > 0)
      .map(({ value }) => value)
      .join('');
  }

  handleTableRef(element?: Element) {
    if (element === undefined) return;
    const options = { sort: { column: 'at', invert: true } } satisfies HeadlessTable.Options;
    this.table = element as HTMLElementTagNameMap['time-shift-data-table'];
    this.table.setData(this.entries as unknown as TableData, this.schema, options);

    // store all rows across all pages
    this.allRows = this.table!.data!.getRows();
  }

  handleInputClick(event: Event) {
    event.stopPropagation();
  }

  handleRowClick(event: HTMLElementEventMap['time-shift-data-table:row-clicked']) {
    const { index } = event.detail.row;
    const input = this.table!.querySelector<HTMLInputElement>(`input[data-row-index="${index}"]`)!;
    input.checked = !input.checked;
    input.dispatchEvent(new Event('change'));
  }

  handlePageTurned() {
    this.requestUpdate();
  }

  handleRowChange(event: Event) {
    // get checked state and row index
    const { checked, dataset } = event.target as HTMLInputElement;
    const index = Number(dataset.rowIndex);
    const selected = new Set(this.selected);

    // set new selection state
    if (checked) {
      selected.add(index);
    } else {
      selected.delete(index);
    }
    this.selected = selected;
  }

  handleSelectAllChange() {
    const { length } = this.entries;
    this.selected = this.selectAll.checked
      ? Array.from({ length }).reduce<Set<number>>((set, _, index) => set.add(index), new Set())
      : new Set();
  }

  handleToggleAll() {
    // trigger the change event of the checkbox
    this.selectAll.checked = !this.selectAll.checked;
    this.selectAll.dispatchEvent(new Event('change'));
  }

  handleToggleVisible() {
    const visible = this.table!.data!.getVisibleRows().map(row => row.index);
    const selected = Array.from(this.selected);
    const checked = visible.every(index => selected.includes(index));

    if (checked) {
      this.selected = new Set(selected.filter(index => !visible.includes(index)));
    } else {
      this.selected = new Set([...selected, ...visible]);
    }
  }

  render() {
    return html`
      <header>
        <time-shift-button @click="${this.handleToggleAll}">
          ${when(
            this.allChecked,
            () => 'Deselect',
            () => 'Select',
          )}
          all
        </time-shift-button>
        <time-shift-button @click="${this.handleToggleVisible}">
          ${when(
            this.visibleChecked,
            () => 'Deselect',
            () => 'Select',
          )}
          visible
        </time-shift-button>
      </header>

      <time-shift-data-table
        .itemsPerPage="${25}"
        @time-shift-data-table:row-clicked="${this.handleRowClick}"
        @time-shift-data-table:turned="${this.handlePageTurned}"
        ${ref(this.handleTableRef)}
      >
        <label slot="header-cell-selected">
          <input
            type="checkbox"
            .indeterminate="${this.selected.size > 0 && this.selected.size < this.allRows.length}"
            ?checked="${this.selected.size === this.entries.length}"
            @change="${this.handleSelectAllChange}"
          />
          <span>${this.selected.size} / ${this.entries.length}</span>
        </label>

        ${when(
          this.allRows !== undefined,
          () => html`
            ${repeat(
              this.allRows,
              row => `${row.index}-${this.selected.has(row.index)}`,
              row =>
                html`
                  <input
                    type="checkbox"
                    slot="row-${row.index}-cell-selected"
                    data-row-index="${row.index}"
                    ?checked="${this.selected.has(row.index)}"
                    @change="${this.handleRowChange}"
                    @click="${this.handleInputClick}"
                  />
                `,
            )}
          `,
        )}
      </time-shift-data-table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-time-entries': TimeEntries;
  }
}

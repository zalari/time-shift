import type { TimeEntry } from '@time-shift/common';
import type { HeadlessTable, TableData, TableSchema } from '@time-shift/data-table';
import '@time-shift/data-table';

import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, query, state } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';

import {
  getDuration,
  getDurationDecimal,
  getDurationToday,
  getDurationYesterday,
  getReadableDate,
} from '../../../utils/time-entry.utils';

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

  @state()
  private decimal = false;

  @property({ type: String, reflect: true })
  readonly locale: string = 'en';

  @property({ type: Array })
  readonly entries: TimeEntry[] = [];

  readonly schema: TableSchema = [
    {
      column: 'selected',
      label: 'Selected',
      type: 'bool',
      width: 1,
    },
    {
      column: 'at',
      label: 'Date',
      type: 'date',
      sortable: true,
      formatter: getReadableDate,
    },
    {
      column: 'minutes',
      label: 'Duration',
      type: 'number',
      sortable: true,
      formatter: getDurationDecimal,
    },
    {
      column: 'note',
      label: 'Notes',
      type: 'string',
      multiline: true,
    },
    {
      column: 'generated',
      label: 'Generated',
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

  getVisibleTimeEntries(): TimeEntry[] {
    const visible = this.table?.data!.getVisibleRows() ?? [];
    return visible.map(row => row.data) as unknown as TimeEntry[];
  }

  getSelectedTimeEntries(): TimeEntry[] {
    return this.allRows
      .filter(row => this.selected.has(row.index))
      .map(row => row.data) as unknown as TimeEntry[];
  }

  handleTableRef(element?: Element) {
    if (element === undefined) return;
    const options = { sort: { column: 'at', invert: false } } satisfies HeadlessTable.Options;
    this.table = element as HTMLElementTagNameMap['time-shift-data-table'];
    this.table.setData(this.entries as unknown as TableData, this.schema, options);

    // store all rows across all pages
    this.allRows = this.table!.data!.getRows();
  }

  @eventOptions({ passive: true })
  handleInputClick(event: Event) {
    event.stopPropagation();
  }

  @eventOptions({ passive: true })
  handleRowClick(event: HTMLElementEventMap['time-shift-data-table:row-clicked']) {
    const { index } = event.detail.row;
    const input = this.table!.querySelector<HTMLInputElement>(`input[data-row-index="${index}"]`)!;
    input.checked = !input.checked;
    input.dispatchEvent(new Event('change'));
  }

  @eventOptions({ passive: true })
  handlePageTurned() {
    this.requestUpdate();
  }

  @eventOptions({ passive: true })
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

  @eventOptions({ passive: true })
  handleSelectAllChange() {
    const { length } = this.entries;
    this.selected = this.selectAll.checked
      ? Array.from({ length }).reduce<Set<number>>((set, _, index) => set.add(index), new Set())
      : new Set();
  }

  @eventOptions({ passive: true })
  handleToggleAll() {
    // trigger the change event of the checkbox
    this.selectAll.checked = !this.selectAll.checked;
    this.selectAll.dispatchEvent(new Event('change'));
  }

  @eventOptions({ passive: true })
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

  @eventOptions({ passive: true })
  handleDecimalChange(event: HTMLElementEventMap['time-shift-duration:decimal-changed']) {
    this.decimal = event.detail;
  }

  render() {
    return html`
      <header>
        <time-shift-duration
          label="Total"
          minutes="${getDuration(this.entries)}"
          ?decimal="${this.decimal}"
          @time-shift-duration:decimal-changed="${this.handleDecimalChange}"
        ></time-shift-duration>
        <time-shift-duration
          label="Yesterday"
          minutes="${getDurationYesterday(this.entries)}"
          ?decimal="${this.decimal}"
          @time-shift-duration:decimal-changed="${this.handleDecimalChange}"
        ></time-shift-duration>
        <time-shift-duration
          label="Today"
          minutes="${getDurationToday(this.entries)}"
          ?decimal="${this.decimal}"
          @time-shift-duration:decimal-changed="${this.handleDecimalChange}"
        ></time-shift-duration>
        <time-shift-duration
          label="Selected"
          minutes="${getDuration(this.getSelectedTimeEntries())}"
          ?decimal="${this.decimal}"
          @time-shift-duration:decimal-changed="${this.handleDecimalChange}"
        ></time-shift-duration>
      </header>

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

        <time-shift-button-group>
          <time-shift-button>Preflight</time-shift-button>
          <time-shift-button disabled>Sync</time-shift-button>
        </time-shift-button-group>
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
            .checked="${this.selected.size === this.entries.length}"
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
                    .checked="${this.selected.has(row.index)}"
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

import type { TimeEntry } from '@time-shift/common';
import type { HeadlessTable, TableData, TableSchema } from '@time-shift/data-table';

import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';

import '@time-shift/data-table';
import styles from './time-entries.component.scss';

type SelectableTimeEntry = TimeEntry & { selected: boolean };

@customElement('time-shift-time-entries')
export class TimeEntries extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  private _entries: SelectableTimeEntry[] = [];
  private _table?: HTMLElementTagNameMap['time-shift-data-table'];

  @property({ type: String, reflect: true })
  locale: string = 'en';

  @property({ type: Array })
  set entries(entries: TimeEntry[]) {
    this._entries = entries.map(entry => ({ ...entry, selected: false }));
  }
  get entries(): TimeEntry[] {
    return this._entries.map(({ selected, ...entry }) => entry);
  }
  get entriesSelected(): TimeEntry[] {
    return this._entries.filter(entry => entry.selected).map(({ selected, ...entry }) => entry);
  }

  readonly dateFormat = new Intl.DateTimeFormat(this.locale, { dateStyle: 'medium' });
  readonly timeFormat = new Intl.RelativeTimeFormat(this.locale, { style: 'short' });

  readonly schema: TableSchema = [
    {
      column: 'selected',
      label: html`<input id="all" type="checkbox" @change="${this.handleToggleAll.bind(this)}" />`,
      type: 'boolean',
      formatter: () => html`<input type="checkbox" />`,
      parser: value => value,
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

  formatMinutes(minutes: number): string {
    return this.timeFormat
      .formatToParts(minutes, 'minutes')
      .filter((_, index) => index > 0)
      .map(({ value }) => value)
      .join('');
  }

  selectAll(checked: boolean) {
    // update data
    this._entries.forEach(entry => (entry.selected = checked));

    // update checkboxes in DOM
    const root = this._table?.shadowRoot;
    const checkboxes = root?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    checkboxes?.forEach(checkbox => {
      checkbox.checked = checked;
      checkbox.indeterminate = false;
    });
  }

  handleTableRef(element?: Element) {
    if (element === undefined) return;
    this._table = element as HTMLElementTagNameMap['time-shift-data-table'];
    const options = { sort: { column: 'at', invert: true } } satisfies HeadlessTable.Options;
    this._table.setData(this._entries as unknown as TableData, this.schema, options);
  }

  handleSelectNone() {
    this.selectAll(false);
  }

  handleToggleAll({ target }: HTMLElementEventMap['change']) {
    const { checked } = target as HTMLInputElement;
    this.selectAll(checked);
  }

  handleSelectRow({ detail }: HTMLElementEventMap['time-shift-data-table:row-clicked']) {
    // toggle single row (in data and DOM)
    this._entries[detail.row.index].selected = !this._entries[detail.row.index].selected;
    const checkbox = detail.ref.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.checked = this._entries[detail.row.index].selected;

    // check for indeterminate state
    const selectAll = this._table?.shadowRoot?.getElementById('all') as HTMLInputElement;
    const allSelected = this._entries.every(entry => entry.selected);
    const noneSelected = this._entries.every(entry => !entry.selected);
    selectAll.indeterminate = !allSelected && !noneSelected;
  }

  handleTest() {
    console.log(this.entriesSelected);
  }

  render() {
    return html`
      <header>
        <time-shift-button @click="${this.handleTest}">Log selected</time-shift-button>
      </header>
      <time-shift-data-table
        .itemsPerPage="${25}"
        @time-shift-data-table:row-clicked="${this.handleSelectRow}"
        @time-shift-data-table:sorted="${this.handleSelectNone}"
        @time-shift-data-table:turned="${this.handleSelectNone}"
        ${ref(this.handleTableRef)}
      ></time-shift-data-table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-time-entries': TimeEntries;
  }
}

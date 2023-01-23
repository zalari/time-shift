import type { TimeEntry } from '@time-shift/common';
import type { TableData, TableSchema } from '@time-shift/data-table';

import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';

import '@time-shift/data-table';
import styles from './time-entries.component.scss';

@customElement('time-shift-time-entries')
export class TimeEntries extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ type: String, reflect: true })
  locale: string = 'en';

  @property({ type: Array })
  entries: TimeEntry[] = [];

  readonly dateFormat = new Intl.DateTimeFormat(this.locale, { dateStyle: 'medium' });
  readonly timeFormat = new Intl.RelativeTimeFormat(this.locale, { style: 'short' });

  readonly schema: TableSchema = [
    {
      column: 'select',
      name: '',
      type: 'boolean',
      formatter: (value: boolean) => html`<input type="checkbox" ?checked="${value}" />`,
      parser: () => undefined,
    },
    {
      column: 'at',
      name: 'Date',
      type: 'date',
      sortable: true,
      formatter: this.dateFormat.format.bind(this),
    },
    {
      column: 'minutes',
      name: 'Minutes',
      type: 'number',
      sortable: true,
      formatter: this.formatMinutes.bind(this),
    },
    {
      column: 'note',
      name: 'Notes',
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

  handleTableRef(element?: Element) {
    if (element === undefined) return;
    const table = element as HTMLElementTagNameMap['time-shift-data-table'];
    table.setData(this.entries as unknown as TableData, this.schema, {
      sort: { column: 'at', invert: true },
    });
  }

  handleRowClick({ detail }: HTMLElementEventMap['time-shift-data-table:row-clicked']) {
    console.log(detail);
  }

  render() {
    return html`
      <header></header>
      <time-shift-data-table
        .itemsPerPage="${25}"
        @time-shift-data-table:row-clicked="${this.handleRowClick}"
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

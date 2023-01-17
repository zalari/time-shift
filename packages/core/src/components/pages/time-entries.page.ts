import { TimeEntry, getAdapter } from '@time-shift/common';
import { RouterLocation } from '@vaadin/router';

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { getQuery } from '../../data/query.data';
import { getConnection } from '../../data/connection.data';

@customElement('time-shift-time-entries-page')
export class TimeEntriesPage extends LitElement {
  readonly location!: RouterLocation;

  @state()
  entries: TimeEntry[] = [];

  override async connectedCallback() {
    super.connectedCallback();

    // reset entries
    this.entries = [];

    // try to get a query
    const query = await getQuery(Number(this.location.params.id));
    if (query === undefined) return;

    // try to get the source connection
    const connection = await getConnection(query.source);
    if (connection === undefined) return;

    // get the adapter
    const { adapter: factory } = getAdapter(connection.type);
    const adapter = await factory(connection.config);

    // prepare the filter fields and fetch the entries
    const fields = Object.entries(query.filters).reduce(
      (all, [name, filter]) => ({ ...all, [name]: { matches: 'eq', value: filter } }),
      {},
    );
    this.entries = await adapter.getTimeEntries(fields);
  }

  render() {
    return html`
      <time-shift-layout-main>
        <time-shift-navigation slot="header"></time-shift-navigation>

        <time-shift-pane slot="aside">
          <time-shift-query-list base="/time-entries"></time-shift-query-list>
        </time-shift-pane>

        <time-shift-time-entries .entries="${this.entries}"></time-shift-time-entries>
      </time-shift-layout-main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-time-entries-page': TimeEntriesPage;
  }
}

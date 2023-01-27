import { type TimeEntry, getAdapter } from '@time-shift/common';
import { RouterLocation } from '@vaadin/router';

import { LitElement, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import { getQuery } from '../../data/query.data';
import { getConnection } from '../../data/connection.data';
import { navigateTo } from '../../utils/router.utils';

@customElement('time-shift-time-entries-page')
export class TimeEntriesPage extends LitElement {
  readonly location!: RouterLocation;

  @state()
  loading = true;

  @state()
  entries: TimeEntry[] = [];

  override async connectedCallback() {
    super.connectedCallback();

    // set loading state and reset entries
    this.loading = true;
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

    // prepare the filter fields
    const fields = Object.entries(query.filters).reduce(
      (all, [name, filter]) => ({ ...all, [name]: filter }),
      {},
    );

    // fetch the entries and align loading state
    this.entries = await adapter.getTimeEntries(fields);
    this.loading = false;
  }

  @eventOptions({ passive: true })
  async handleQueryEdit(event: HTMLEventListenerMap['time-shift-query-list:action']) {
    navigateTo(`/settings/query/${event.detail}`);
  }

  render() {
    return html`
      <time-shift-layout-main>
        <time-shift-navigation slot="header"></time-shift-navigation>

        <time-shift-pane slot="aside">
          <time-shift-query-list
            base="/time-entries"
            action-label="Edit"
            @time-shift-query-list:action="${this.handleQueryEdit}"
          ></time-shift-query-list>
        </time-shift-pane>

        ${when(
          this.loading,
          () => html`<span>Loading...</span>`,
          () => html`
            ${when(
              !this.entries.length,
              () => html`<span>No entries found</span>`,
              () =>
                html`
                  <time-shift-time-entries .entries="${this.entries}"></time-shift-time-entries>
                `,
            )}
          `,
        )}
      </time-shift-layout-main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-time-entries-page': TimeEntriesPage;
  }
}

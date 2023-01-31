import { type TimeEntry, getAdapter } from '@time-shift/common';
import { RouterLocation } from '@vaadin/router';

import { LitElement, html } from 'lit';
import { customElement, eventOptions, query, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import { type Query, getQuery } from '../../data/query.data';
import { getConnection } from '../../data/connection.data';
import { navigateTo } from '../../utils/router.utils';

@customElement('time-shift-time-entries-page')
export class TimeEntriesPage extends LitElement {
  readonly location!: RouterLocation;

  @query('time-shift-time-entries')
  readonly timeEntriesRef!: HTMLElementTagNameMap['time-shift-time-entries'];

  @state()
  loading = true;

  @state()
  selected = false;

  @state()
  query?: Query;

  @state()
  entries: TimeEntry[] = [];

  override async connectedCallback() {
    super.connectedCallback();

    // set loading state and reset entries
    this.loading = true;
    this.entries = [];

    // try to get a query
    this.query = await getQuery(Number(this.location.params.id));
    if (this.query === undefined) return;

    // try to get the source connection
    const connection = await getConnection(this.query.source);
    if (connection === undefined) return;

    // get the adapter
    const { adapter: factory } = getAdapter(connection.type);
    const adapter = await factory(connection.config);

    // fetch the entries and align loading state
    this.entries = await adapter.getTimeEntries(this.query.filters, this.query.mapping);
    this.loading = false;
  }

  @eventOptions({ passive: true })
  async handleQueryEdit(event: HTMLElementEventMap['time-shift-query-list:action']) {
    navigateTo(`/settings/query/${event.detail}`);
  }

  @eventOptions({ passive: true })
  handleSelectionChange(event: HTMLElementEventMap['time-shift-time-entries:selection-change']) {
    this.selected = event.detail.length > 0;
  }

  @eventOptions({ passive: true })
  async handlePreflightClick() {
    if (this.query === undefined) return;

    // try to get the target connection
    const connection = await getConnection(this.query.target);
    if (connection === undefined) return;

    // get the adapter
    const { adapter: factory } = getAdapter(connection.type);
    const adapter = await factory(connection.config);

    // fetch the prefight result
    const entries = this.timeEntriesRef.getSelectedTimeEntries();
    const result = await adapter.getPreflight(entries, this.query.strategy);

    // @TODO: implement preflight UI
    console.log(result);
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
                  <time-shift-time-entries
                    .entries="${this.entries}"
                    @time-shift-time-entries:selection-change="${this.handleSelectionChange}"
                  >
                    <time-shift-button-group slot="actions">
                      <time-shift-button
                        ?disabled="${!this.selected}"
                        @click="${this.handlePreflightClick}"
                      >
                        Preflight
                      </time-shift-button>
                      <time-shift-button disabled>Sync</time-shift-button>
                    </time-shift-button-group>
                  </time-shift-time-entries>
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

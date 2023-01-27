import { LitElement, html } from 'lit';
import { customElement, eventOptions } from 'lit/decorators.js';

import { type Connection, getConnection } from '../../data/connection.data';
import { getQuery, type Query } from '../../data/query.data';

import { handleNavigation, navigateTo } from '../../utils/router.utils';
import { encodeParamValue } from '../../utils/url.utils';

@customElement('time-shift-settings-page')
export class SettingsPage extends LitElement {
  @eventOptions({ passive: true })
  async handleConnectionClone(event: HTMLEventListenerMap['time-shift-connection-list:action']) {
    const connection = await getConnection(event.detail);
    const { id, name, ...entries } = connection!;
    const clone = { ...entries!, name: `${name} (Clone)` } satisfies Omit<Connection, 'id'>;
    navigateTo(`/settings/connection/new/${encodeParamValue(clone)}`);
  }
  
  @eventOptions({ passive: true })
  async handleQueryClone(event: HTMLEventListenerMap['time-shift-query-list:action']) {
    const query = await getQuery(event.detail);
    const { id, name, ...entries } = query!;
    const clone = { ...entries!, name: `${name} (Clone)` } satisfies Omit<Query, 'id'>;
    navigateTo(`/settings/query/new/${encodeParamValue(clone)}`);
  }

  render() {
    return html`
      <time-shift-layout-main>
        <time-shift-navigation slot="header"></time-shift-navigation>

        <time-shift-pane slot="aside" headline="Connections">
          <time-shift-button
            slot="actions"
            @click="${handleNavigation('/settings/connection/new')}"
          >
            Add
          </time-shift-button>
          <time-shift-connection-list
            base="/settings/connection"
            action-label="Clone"
            @time-shift-connection-list:action="${this.handleConnectionClone}"
          ></time-shift-connection-list>
        </time-shift-pane>

        <time-shift-pane slot="aside" headline="Queries">
          <time-shift-button slot="actions" @click="${handleNavigation('/settings/query/new')}">
            Add
          </time-shift-button>
          <time-shift-query-list
            base="/settings/query"
            action-label="Clone"
            @time-shift-query-list:action="${this.handleQueryClone}"
          ></time-shift-query-list>
        </time-shift-pane>

        <slot>
          <time-shift-explanation></time-shift-explanation>
        </slot>
      </time-shift-layout-main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-settings-page': SettingsPage;
  }
}

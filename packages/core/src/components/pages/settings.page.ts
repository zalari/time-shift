import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { handleNavigation } from '../../utils/router.utils';

@customElement('time-shift-settings-page')
export class SettingsPage extends LitElement {
  render() {
    return html`
      <time-shift-layout-main>
        <time-shift-navigation slot="header"></time-shift-navigation>

        <time-shift-pane slot="aside" headline="Connections">
          <time-shift-button slot="actions" @click="${handleNavigation('/settings/connection/new')}">
            Add
          </time-shift-button>
          <time-shift-connection-list></time-shift-connection-list>
        </time-shift-pane>

        <time-shift-pane slot="aside" headline="Queries">
          <time-shift-button slot="actions" @click="${handleNavigation('/settings/query/new')}">
            Add
          </time-shift-button>
          <time-shift-query-list base="/settings/query"></time-shift-query-list>
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

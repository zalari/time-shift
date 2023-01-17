import { LitElement, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';

import { createConnection } from '../../data/connection.data';
import { handleNavigation, navigateTo } from '../../utils/router.utils';

@customElement('time-shift-connection-new-page')
export class ConnectionNewPage extends LitElement {
  @state()
  disabled = false;

  @eventOptions({ passive: true })
  async handleSaveData(event: ElementEventMap['connection-edit:save-data']) {
    this.disabled = true;
    const id = await createConnection(event.detail);
    navigateTo(`/settings/connection/${id}`);
  }

  render() {
    return html`
      <h1>New connection</h1>
      <time-shift-connection-edit
        label="Create"
        ?disabled="${this.disabled}"
        @connection-edit:save-data="${this.handleSaveData}"
      >
        <time-shift-button slot="actions" @click="${handleNavigation('/settings')}">Close</time-shift-button>
      </time-shift-connection-edit>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-connection-new-page': ConnectionNewPage;
  }
}

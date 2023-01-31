import type { RouterLocation } from '@vaadin/router';
import { LitElement, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';

import { type Connection, createConnection } from '../../data/connection.data';
import { handleNavigation, navigateTo } from '../../utils/router.utils';
import { decodeParamValue } from '../../utils/url.utils';

@customElement('time-shift-connection-new-page')
export class ConnectionNewPage extends LitElement {
  readonly location!: RouterLocation;

  @state()
  disabled = false;

  @state()
  connection?: Connection;

  @eventOptions({ passive: true })
  async handleSaveData(event: HTMLElementEventMap['connection-edit:save-data']) {
    this.disabled = true;
    const id = await createConnection(event.detail);
    navigateTo(`/settings/connection/${id}`);
  }

  override connectedCallback() {
    super.connectedCallback();
    const { prefill } = this.location.params;
    if (prefill !== undefined) {
      this.connection = decodeParamValue(prefill as string);
    }
  }

  render() {
    return html`
      <h1>New connection</h1>
      <time-shift-connection-edit
        label="Create"
        ?disabled="${this.disabled}"
        .data="${this.connection}"
        @connection-edit:save-data="${this.handleSaveData}"
      >
        <time-shift-button slot="actions" @click="${handleNavigation('/settings')}">
          Close
        </time-shift-button>
      </time-shift-connection-edit>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-connection-new-page': ConnectionNewPage;
  }
}

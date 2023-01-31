import type { RouterLocation } from '@vaadin/router';
import { LitElement, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import { handleNavigation, navigateTo } from '../../utils/router.utils';

import {
  type Connection,
  updateConnection,
  deleteConnection,
  getConnection,
} from '../../data/connection.data';

@customElement('time-shift-connection-edit-page')
export class ConnectionEditPage extends LitElement {
  readonly location!: RouterLocation;

  @state()
  disabled = false;

  @state()
  connection?: Connection;

  @eventOptions({ passive: true })
  async handleSaveData({ detail }: HTMLElementEventMap['connection-edit:save-data']) {
    this.disabled = true;
    this.connection = { ...detail, id: this.connection!.id } as Connection;
    await updateConnection(this.connection);
    this.disabled = false;
  }

  @eventOptions({ passive: true })
  async handleDelete() {
    this.disabled = true;
    if (confirm(`Delete connection "${this.connection?.name}"?`)) {
      await deleteConnection(this.connection!.id);
      navigateTo('/settings');
    }
    this.disabled = false;
  }

  override async connectedCallback() {
    super.connectedCallback();

    const { id } = this.location.params;
    const connection = await getConnection(Number(id));
    this.connection = connection;
  }

  render() {
    return html`${when(
      this.connection !== undefined,
      () => html`
        <h1>Edit connection</h1>
        <time-shift-connection-edit
          label="Update"
          ?disabled="${this.disabled}"
          .data="${this.connection}"
          @connection-edit:save-data="${this.handleSaveData}"
        >
          <time-shift-button slot="actions" @click="${handleNavigation('/settings')}">Close</time-shift-button>
          <time-shift-button slot="actions" @click="${this.handleDelete}">Delete</time-shift-button>
        </time-shift-connection-edit>
      `,
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-connection-edit-page': ConnectionEditPage;
  }
}

import { getAdapter } from '@time-shift/common';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import type { Connection } from '../../../data/connection.data';

import styles from './connection-test.component.scss';

@customElement('time-shift-connection-test')
export class ConnectionTest extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String, reflect: true })
  status: HTMLElementTagNameMap['time-shift-connection-status']['status'] = 'initial';

  @property({ type: Object })
  data?: Omit<Connection, 'id'>;

  async handleClick() {
    if (this.data === undefined) return;
    if (this.status === 'loading') return;
    this.status = 'loading';

    const factory = getAdapter(this.data.type).adapter;
    const connection = await factory(this.data.config as any);
    const result = await connection.checkConnection();

    this.status = result ? 'success' : 'error';
  }

  reset() {
    this.status = 'initial';
  }

  render() {
    return html`
      <time-shift-button
        type="button"
        ?disabled="${this.disabled || this.status === 'loading'}"
        @click="${this.handleClick}"
      >
        <time-shift-connection-status status="${this.status}"></time-shift-connection-status>
        <slot></slot>
      </time-shift-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-connection-test': ConnectionTest;
  }
}

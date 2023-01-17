import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './connection-status.component.scss';

@customElement('time-shift-connection-status')
export class ConnectionStatus extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: String })
  status: 'initial' | 'loading' | 'success' | 'error' = 'initial';

  render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-connection-status': ConnectionStatus;
  }
}

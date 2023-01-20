import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './table.component.scss';

@customElement('time-shift-table')
export class Table extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: String })
  readonly role = 'table';

  @property({ reflect: true, type: Boolean })
  dragging = false;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-table': Table;
  }
}

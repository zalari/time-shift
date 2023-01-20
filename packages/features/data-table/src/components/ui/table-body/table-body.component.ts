import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './table-body.component.scss';

@customElement('time-shift-table-body')
export class TableBody extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: String })
  readonly role = 'rowgroup';

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-table-body': TableBody;
  }
}

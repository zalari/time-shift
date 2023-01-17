import { LitElement, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import styles from './wrapper.component.scss';

@customElement('time-shift-wrapper')
export class Wrapper extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-wrapper': Wrapper;
  }
}

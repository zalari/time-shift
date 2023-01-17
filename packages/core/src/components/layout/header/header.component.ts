import { LitElement, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import styles from './header.component.scss';

@customElement('time-shift-header')
export class Header extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  render() {
    return html`
      <time-shift-actions>
        <slot></slot>
        <slot name="end" slot="end"></slot>
      </time-shift-actions>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-header': Header;
  }
}

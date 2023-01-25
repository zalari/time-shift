import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './nav-items.component.scss';

@customElement('time-shift-nav-items')
export class NavItems extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: String })
  empty?: string;

  render() {
    return html`<slot>${this.empty}</slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-nav-items': NavItems;
  }
}

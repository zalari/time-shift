import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './time-entries-header.component.scss';

@customElement('time-shift-time-entries-header')
export class TimeEntriesHeader extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ type: String, reflect: true })
  readonly role: string = 'header';

  render() {
    return html`
      <div class="header">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-time-entries-header': TimeEntriesHeader;
  }
}

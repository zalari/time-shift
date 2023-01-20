import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './pagination-button.component.scss';

@customElement('time-shift-pagination-button')
export class PaginationButton extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: Boolean })
  active = false;

  @property({ reflect: true, type: Boolean })
  disabled = false;

  @property({ reflect: true, type: String })
  arrow?: 'left' | 'right';

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-pagination-button': PaginationButton;
  }
}

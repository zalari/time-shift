import { LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './pagination-dots.component.scss';

@customElement('time-shift-pagination-dots')
export class PaginationDots extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: Boolean })
  active = false;

  @property({ reflect: true, type: Boolean })
  arrow = false;

  @property({ reflect: true, type: Boolean })
  disabled = false;

  @property({ reflect: true, type: String })
  direction?: 'left' | 'right';

  render() {
    return '...';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-pagination-dots': PaginationDots;
  }
}

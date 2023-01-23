import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './table-row.component.scss';

@customElement('time-shift-table-row')
export class TableRow extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: Boolean })
  draggable = false;

  @property({ reflect: true, type: Boolean, attribute: 'droppable-after' })
  droppableAfter = false;

  @property({ reflect: true, type: Boolean, attribute: 'droppable-before' })
  droppableBefore = false;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-table-row': TableRow;
  }
}

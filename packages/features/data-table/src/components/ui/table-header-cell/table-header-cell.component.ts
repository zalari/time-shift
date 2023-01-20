import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './table-header-cell.component.scss';

@customElement('time-shift-table-header-cell')
export class TableHeaderCell extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: String })
  readonly role = 'columnheader';

  @property({ reflect: true, type: String })
  align: 'left' | 'right' = 'left';

  @property({ reflect: true, type: Boolean })
  sortable = false;

  @property({ reflect: true, type: String })
  sorted?: 'asc' | 'desc';

  @property({ reflect: true, type: Boolean })
  draggable = false;

  @property({ reflect: true, type: Boolean })
  dragging = false;

  @property({ reflect: true, type: String, attribute: 'dragged-over' })
  draggedOver?: 'top' | 'right' | 'bottom' | 'left';

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-table-header-cell': TableHeaderCell;
  }
}

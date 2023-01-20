import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './table-cell.component.scss';

@customElement('time-shift-table-cell')
export class TableCell extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: String })
  readonly role = 'cell';

  @property({ reflect: true, type: String })
  align: 'left' | 'right' = 'left';

  @property({ reflect: true, type: Boolean })
  multiline = false;

  @property({ reflect: true, type: Boolean })
  draggable = false;

  @property({ reflect: true, type: Boolean })
  dragging = false;

  @property({ reflect: true, type: String, attribute: 'dragged-over' })
  draggedOver?: 'top' | 'right' | 'bottom' | 'left';

  render() {
    return html`
      <div class="content">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-table-cell': TableCell;
  }
}

import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './button-group.component.scss';

@customElement('time-shift-button-group')
export class ButtonGroup extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-button-group': ButtonGroup;
  }
}

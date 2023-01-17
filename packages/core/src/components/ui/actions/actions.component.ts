import { html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import style from './actions.component.scss';

@customElement('time-shift-actions')
export class Actions extends LitElement {
  static readonly styles = unsafeCSS(style);

  protected render() {
    return html`
      <slot name="start"></slot>
      <slot></slot>
      <slot name="end"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-actions': Actions;
  }
}

import { html, LitElement, PropertyValues, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import iconStyle from './icon.component.scss';

@customElement('time-shift-icon')
export class Icon extends LitElement {
  static readonly styles = unsafeCSS(iconStyle);

  /**
   * Allows setting the icon size conveniently via an attribute.
   */
  @property({ reflect: true, type: Number })
  size?: number;

  override updated(changedProps: PropertyValues<this>) {
    if (changedProps.has('size') && this.size) {
      this.style.setProperty('--time-shift-icon-size', `${this.size}px`);
    } else {
      this.style.removeProperty('--time-shift-icon-size');
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-icon': Icon;
  }
}

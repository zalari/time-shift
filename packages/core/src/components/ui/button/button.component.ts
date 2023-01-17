import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './button.component.scss';

@customElement('time-shift-button')
export class Button extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: Boolean })
  disabled = false;

  @property({ reflect: true, type: String })
  type: 'button' | 'submit' | 'reset' = 'button';

  handleClick() {
    if (this.type === 'submit') {
      this.closest('form')?.dispatchEvent(new Event('submit'));
    }
  }

  render() {
    return html`
      <button
        part="button"
        ?disabled="${this.disabled}"
        type="${this.type}"
        @click="${this.handleClick}"
      >
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-button': Button;
  }
}

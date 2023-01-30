import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import style from './fieldset.component.scss';

@customElement('time-shift-fieldset')
export class Fieldset extends LitElement {
  static readonly styles = unsafeCSS(style);

  /**
   * Disables the fieldset.
   */
  @property({ reflect: true, type: Boolean })
  disabled = false;

  /**
   * A legend to be used.
   */
  @property({ reflect: true, type: String })
  legend?: string;

  /**
   * An optional description to be shown up front.
   */
  @property({ reflect: true, type: String })
  description?: string;

  protected render() {
    return html`
      <fieldset ?disabled=${this.disabled}>
        ${this.legend !== undefined ? html`<legend>${this.legend}</legend>` : nothing}
        ${this.description !== undefined ? html`<p>${this.description}</p>` : nothing}
        <div>
          <slot></slot>
        </div>
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-fieldset': Fieldset;
  }
}

import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import style from './fieldset.component.scss';

@customElement('time-shift-fieldset')
export class Fieldset extends LitElement {
  static readonly styles = unsafeCSS(style);

  /**
   * disable the fieldset
   */
  @property({ reflect: true, type: Boolean })
  disabled = false;

  /**
   * legend to be used
   */
  @property({ reflect: true, type: String })
  legend?: string;

  protected render() {
    return html`
      <fieldset ?disabled=${this.disabled}>
        ${this.legend !== undefined ? html`<legend>${this.legend}</legend>` : nothing}
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

import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { Editable } from './input.component.mixin';

import style from './input-number.component.scss';

@customElement('time-shift-input-number')
export class InputNumber extends Editable<number, HTMLInputElement>()(LitElement) {
  static readonly styles = unsafeCSS(style);

  override readonly primitive = Number;

  @query('input')
  override readonly nativeInput!: HTMLInputElement;

  @property({ reflect: true, type: Boolean })
  disabled?: boolean;

  @property({ reflect: true, type: Boolean })
  required?: boolean;

  @property({ reflect: true, type: Number })
  min?: number;

  @property({ reflect: true, type: Number })
  max?: number;

  /**
   * Allows setting a custom formatter function for the display value.
   * e.g. ``
   */
  @property({ type: Function })
  formatValue: (value: number | null | undefined) => string = this.stringifyValue;

  protected renderInput() {
    return html`
      <input
        part="input"
        type="number"
        autocomplete="${this.disableAutocomplete ? 'off' : 'on'}"
        name="${ifDefined(this.name)}"
        placeholder="${ifDefined(this.placeholder)}"
        min="${ifDefined(this.min)}"
        max="${ifDefined(this.max)}"
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        .value="${live(this.stringifyValue(this.value))}"
        @blur="${this.handleBlur}"
        @change="${this.handleChange}"
        @input="${this.handleInput}"
      />
    `;
  }

  protected render() {
    return html`
      <label class="${classMap({ invalid: this.invalid })}">
        ${this.renderInput()} ${this.renderContent()}
        <span class="display">${this.formatValue(this.value)}</span>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-input-number': InputNumber;
  }
}

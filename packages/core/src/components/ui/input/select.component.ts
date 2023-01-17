import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import type { Primitive } from '../../../utils/type.utils';
import { Editable } from './input.component.mixin';

import style from './select.component.scss';

export type SelectOption<T> = {
  label: string;
  value: T;
  disabled?: boolean;
  selected?: boolean;
};

@customElement('time-shift-select')
export class Select<T = string> extends Editable()(LitElement) {
  static readonly styles = unsafeCSS(style);

  protected override isAfterSlotEmpty = false;

  @query('select')
  override readonly nativeInput!: HTMLSelectElement;

  @property({ reflect: true })
  primitive!: Primitive<T>;

  @property({ reflect: true, type: Array })
  options: SelectOption<typeof this.primitive>[] = [];

  @property({ reflect: true, type: Boolean })
  disabled?: boolean;

  @property({ reflect: true, type: Boolean })
  required?: boolean;

  @property({ attribute: 'include-empty-option', reflect: true, type: Boolean })
  includeEmptyOption?: boolean;

  protected override renderInput() {
    return html`
      <select
        part="input"
        name="${ifDefined(this.name)}"
        placeholder="${ifDefined(this.placeholder)}"
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        .value="${live(this.stringifyValue(this.value))}"
        @blur="${this.handleBlur}"
        @change="${this.handleChange}"
        @input="${this.handleInput}"
      >
        ${when(
          this.includeEmptyOption,
          () => html`<option disabled selected value="">${this.placeholder}</option>`,
        )}
        ${map(
          this.options,
          ({ label, value, disabled, selected }) => html`
            <option
              ?disabled="${disabled}"
              ?selected="${value === this.value || selected}"
              value="${ifDefined(value)}"
            >
              ${label}
            </option>
          `,
        )}
      </select>
    `;
  }

  protected override renderAfter() {
    return html`
      <span class="after">
        <slot name="after"></slot>
        <time-shift-icon-arrow-down size="14"></time-shift-icon-arrow-down>
      </span>
    `;
  }

  protected render() {
    return html`
      <label class="${classMap({ invalid: this.invalid })}">
        ${this.renderInput()} ${this.renderContent()}
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-select': Select;
  }
}

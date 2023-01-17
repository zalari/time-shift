import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';

import { Editable } from './input.component.mixin';

import style from './switch.component.scss';

@customElement('time-shift-switch')
export class Switch extends Editable<boolean, HTMLInputElement>()(LitElement) {
  static readonly styles = unsafeCSS(style);

  override readonly primitive = Boolean;

  @query('input')
  override readonly nativeInput!: HTMLInputElement;

  @property({ reflect: true, type: Boolean })
  value = false;

  @property({ reflect: true, type: Boolean })
  disabled?: boolean;

  @property({ reflect: true, type: Boolean })
  required?: boolean;

  @eventOptions({ passive: true })
  protected override handleChange() {
    this.value = this.primitive(this.nativeInput.checked);

    // check for validity if configured
    if (this.validateOn.includes('change')) {
      this.triggerValidation(true);
    }
  }

  @eventOptions({ passive: true })
  protected override handleInput() {
    this.value = this.primitive(this.nativeInput.checked);

    // check for validity if configured
    if (this.validateOn.includes('input')) {
      this.triggerValidation(true);
    }
  }

  protected override renderInput() {
    return html`
      <input
        part="input"
        type="checkbox"
        name="${ifDefined(this.name)}"
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        ?checked="${this.value}"
        @blur="${this.handleBlur}"
        @change="${this.handleChange}"
        @input="${this.handleInput}"
      />
      <span class="toggle"></span>
      ${when(
        this.placeholder !== undefined,
        () => html`<span class="placeholder">${this.placeholder}</span>`,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-switch': Switch;
  }
}

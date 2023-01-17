import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { when } from 'lit/directives/when.js';

import { Editable } from './input.component.mixin';

import style from './input-text.component.scss';

@customElement('time-shift-input-text')
export class InputText extends Editable<string, HTMLInputElement | HTMLTextAreaElement>()(
  LitElement,
) {
  static readonly styles = unsafeCSS(style);

  override readonly primitive = String;

  @query('input, textarea')
  override readonly nativeInput!: HTMLInputElement | HTMLTextAreaElement;

  @property({ reflect: true, type: Boolean })
  disabled?: boolean;

  @property({ reflect: true, type: Boolean })
  required?: boolean;

  @property({ reflect: true, type: Boolean })
  multiline?: boolean;

  @property({ reflect: true, type: Number })
  maxlength?: number;

  @property({ reflect: true, type: String })
  separator = '/';

  protected override renderInput() {
    return html`
      ${when(
        this.multiline,
        () => html`
          <textarea
            part="input"
            name="${ifDefined(this.name)}"
            placeholder="${ifDefined(this.placeholder)}"
            maxlength="${ifDefined(this.maxlength)}"
            ?disabled="${this.disabled}"
            ?required="${this.required}"
            .value="${live(this.stringifyValue(this.value))}"
            @blur="${this.handleBlur}"
            @change="${this.handleChange}"
            @input="${this.handleInput}"
          ></textarea>
        `,
        () => html`
          <input
            part="input"
            type="text"
            name="${ifDefined(this.name)}"
            placeholder="${ifDefined(this.placeholder)}"
            maxlength="${ifDefined(this.maxlength)}"
            ?disabled="${this.disabled}"
            ?required="${this.required}"
            .value="${live(this.stringifyValue(this.value))}"
            @blur="${this.handleBlur}"
            @change="${this.handleChange}"
            @input="${this.handleInput}"
          />
        `,
      )}
    `;
  }

  protected render() {
    return html`
      <label
        class="${classMap({ invalid: this.invalid })}"
        data-replicated-value="${when(
          this.multiline,
          () => this.stringifyValue(this.value),
          () => nothing,
        )}"
      >
        ${this.renderInput()}
        ${when(
          this.multiline && this.maxlength !== undefined,
          () =>
            html`<span class="hint"
              >${this.value?.length ?? 0} ${this.separator} ${this.maxlength}</span
            >`,
        )}
        ${this.renderContent()}
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-input-text': InputText;
  }
}

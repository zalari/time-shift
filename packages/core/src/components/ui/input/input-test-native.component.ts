import { html, LitElement, css, nothing, unsafeCSS, PropertyValueMap } from 'lit';
import { customElement, property, query, queryAsync } from 'lit/decorators.js';

import style from './input-text-native.component.scss';
import { FormAssociated } from '@/utils/formAssociated.utils';

@customElement('time-shift-input-text-native')
export class InputTextNative extends LitElement implements FormAssociated {
  static readonly styles = unsafeCSS(style);
  static readonly formAssociated = true;

  @query('div')
  nativeInput!: HTMLElement;

  @query('span')
  border!: HTMLElement;

  @property()
  value = '';

  @property({ type: String, reflect: true })
  name?: string;

  @property({ type: String, reflect: true })
  placeholder?: string;

  @property({ type: Boolean, reflect: true })
  required?: boolean;

  readonly #internals = this.attachInternals();

  override firstUpdated(): void {
    this.setAttribute('tabindex', '0');
    this.tabIndex = 0;
  }

  private async _setInputasValid() {
    this.#internals.setValidity({});
    await this.updateComplete;
    this.border.classList.remove('invalid');
  }

  private async _setInputAsInvalid() {
    this.#internals.setValidity({ customError: true }, 'Field can not be emtpy');
    await this.updateComplete;
    this.border.classList.add('invalid');
  }

  formAssociatedCallback() {
    if (this.required) {
      this._setInputAsInvalid();
      this.#internals.setFormValue(null);
    }
  }

  private _handleInput(event: Event) {
    event.preventDefault();
    const entries = new FormData();
    const inputContent = this.nativeInput.textContent ?? '';

    this.value = inputContent;

    if (!this.name) {
      throw new Error('Input name is undefined');
    }

    if (!this.value && this.required) {
      this._setInputAsInvalid();
      this.#internals.setFormValue(null);
      return;
    }

    this._setInputasValid();
    entries.append(this.name, this.value);
    this.#internals.setFormValue(entries);
  }

  protected render() {
    return html`
      <label>
        <div
          contenteditable
          @input=${this._handleInput}
          name=${this.name}
          data-placeholder=${this.placeholder}
        ></div>
        <span id="border" class="border"></span>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-input-text-native': InputTextNative;
  }
}

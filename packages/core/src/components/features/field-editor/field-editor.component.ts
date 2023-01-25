import type { AdapterFieldType, AdapterFieldTypeMap } from '@time-shift/common';
import { type TemplateResult, LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';

import { Primitive } from '../../../utils/type.utils';
import type { EditableInterface } from '../../ui/input/input.component.mixin';
import { SelectOption } from '../../ui/input/select.component';

import styles from './field-editor.component.scss';

@customElement('time-shift-field-editor')
export class FieldEditor extends LitElement {
  static override readonly styles = unsafeCSS(styles);
  static readonly formAssociated = true;

  @query('.input')
  readonly element!: EditableInterface<any>;

  @property({ reflect: true, type: String })
  type!: AdapterFieldType;

  @property({ reflect: true, type: String })
  label!: string;

  @property({ reflect: true, type: String })
  name?: string;

  @property({ reflect: true, type: String })
  message?: string;

  @property({ reflect: true, type: String })
  placeholder?: string;

  @property({ reflect: true, type: Boolean })
  disabled = false;

  @property({ reflect: true, type: Boolean })
  required = false;

  @property({ reflect: true, type: Array })
  options?: SelectOption<AdapterFieldTypeMap[typeof this.type]>[];

  @property({ reflect: true })
  value?: AdapterFieldTypeMap[typeof this.type];

  renderBoolean(): TemplateResult {
    return html`
      <time-shift-switch
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        class="input"
        label="${this.label}"
        name="${ifDefined(this.name)}"
        placeholder="${ifDefined(this.placeholder)}"
        message="${ifDefined(this.message)}"
        .value="${Boolean(this.value)}"
      ></time-shift-switch>
    `;
  }

  renderString(type: HTMLElementTagNameMap['time-shift-input-text']['type']): TemplateResult {
    return html`
      ${when(
        this.options === undefined,
        () => html`
          <time-shift-input-text
            ?disabled=${this.disabled}
            ?required=${this.required}
            disable-autocomplete
            class="input"
            label="${this.label}"
            type="${type}"
            name="${ifDefined(this.name)}"
            placeholder="${ifDefined(this.placeholder)}"
            message="${ifDefined(this.message)}"
            .value="${this.value}"
          ></time-shift-input-text>
        `,
        () => this.renderSelect(String),
      )}
    `;
  }

  renderNumber(): TemplateResult {
    return html`
      ${when(
        this.options === undefined,
        () => html`
          <time-shift-input-number
            ?disabled=${this.disabled}
            ?required=${this.required}
            disable-autocomplete
            class="input"
            label="${this.label}"
            name="${ifDefined(this.name)}"
            placeholder="${ifDefined(this.placeholder)}"
            message="${ifDefined(this.message)}"
            .value="${this.value}"
          ></time-shift-input-number>
        `,
        () => this.renderSelect(Number),
      )}
    `;
  }

  renderDate(): TemplateResult {
    return html`
      <time-shift-input-number
        ?disabled=${this.disabled}
        ?required=${this.required}
        class="input"
        label="${this.label}"
        name="${ifDefined(this.name)}"
        placeholder="${ifDefined(this.placeholder)}"
        message="${ifDefined(this.message)}"
        .value="${+(this.value as Date)}"
      ></time-shift-input-number>
    `;
  }

  renderSelect(primitive: Primitive<any>): TemplateResult {
    return html`
      <time-shift-select
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        class="input"
        label="${this.label}"
        name="${ifDefined(this.name)}"
        placeholder="${ifDefined(this.placeholder)}"
        message="${ifDefined(this.message)}"
        .primitive="${primitive}"
        .options="${this.options}"
        .value="${this.value}"
      ></time-shift-select>
    `;
  }

  renderUrl(): TemplateResult {
    return html`
      <time-shift-input-text
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        class="input"
        label="${this.label}"
        name="${ifDefined(this.name)}"
        placeholder="${ifDefined(this.placeholder)}"
        message="${ifDefined(this.message)}"
        .value="${this.value}"
      >
        <time-shift-toggle-cors
          ?disabled="${this.disabled}"
          slot="below"
          input-name="${ifDefined(this.name)}"
          label="Add CORS proxy to url"
        ></time-shift-toggle-cors>
      </time-shift-input-text>
    `;
  }

  render() {
    return html`
      ${choose(this.type, [
        ['boolean', () => this.renderBoolean()],
        ['date', () => this.renderDate()],
        ['number', () => this.renderNumber()],
        ['string', () => this.renderString('text')],
        ['email', () => this.renderString('email')],
        ['token', () => this.renderString('password')],
        ['url', () => this.renderUrl()],
      ])}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-field-editor': FieldEditor;
  }
}

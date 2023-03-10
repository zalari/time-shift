import type { AdapterFieldType, AdapterFieldTypeMap, AdapterFields } from '@time-shift/common';
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

  @property({ type: String, reflect: true })
  type!: AdapterFieldType;

  @property({ type: String, reflect: true })
  label!: string;

  @property({ type: String, reflect: true })
  name!: string;

  @property({ type: String, reflect: true })
  message?: string;

  @property({ type: String, reflect: true })
  placeholder?: string;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Array, reflect: true })
  options?: SelectOption<AdapterFieldTypeMap[typeof this.type]>[];

  @property({ type: Object })
  fields?: AdapterFields;

  @property()
  value?: AdapterFieldTypeMap[typeof this.type];

  renderBoolean(): TemplateResult {
    return html`
      <time-shift-switch
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        class="input"
        label="${this.label}"
        name="${this.name}"
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
            name="${this.name}"
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
            name="${this.name}"
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
      <time-shift-input-date
        ?disabled=${this.disabled}
        ?required=${this.required}
        disable-autocomplete
        class="input"
        label="${this.label}"
        name="${this.name}"
        placeholder="${ifDefined(this.placeholder)}"
        message="${ifDefined(this.message)}"
        .value="${this.value}"
      ></time-shift-input-date>
    `;
  }

  renderSelect(primitive: Primitive<any>): TemplateResult {
    return html`
      <time-shift-select
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        disable-autocomplete
        class="input"
        label="${this.label}"
        name="${this.name}"
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
        name="${this.name}"
        placeholder="${ifDefined(this.placeholder)}"
        message="${ifDefined(this.message)}"
        .value="${this.value}"
      >
        <time-shift-toggle-cors
          ?disabled="${this.disabled}"
          slot="below"
          input-name="${this.name}"
          label="Add CORS proxy to url"
        ></time-shift-toggle-cors>
      </time-shift-input-text>
    `;
  }

  renderGroup(): TemplateResult {
    return html`
      <time-shift-group-editor
        ?disabled="${this.disabled}"
        class="input"
        name="${this.name}"
        add-label="Add ${this.label}"
        remove-label="Remove ${this.label}"
        select-label="Select ${this.label}"
        .fields="${this.fields}"
        .value="${this.value}"
      ></time-shift-group-editor>
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
        ['group', () => this.renderGroup()],
      ])}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-field-editor': FieldEditor;
  }
}

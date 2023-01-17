import type { AdapterField, AdapterFieldTypeMap } from '@time-shift/common';
import { type TemplateResult, html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

// return html`
// <time-shift-select
//   required
//   ?disabled="${this.disabled}"
//   validate-on="input blur"
//   label="${this.label}"
//   name="${ifDefined(this.name)}"
//   placeholder="${ifDefined(this.placeholder)}"
//   .options="${this.options}"
//   .value="${live(this.value)}"
// ></time-shift-select>
// `;

export const getFieldEditor = <A extends AdapterField, V extends AdapterFieldTypeMap[A['type']]>(
  field: A,
  name: string,
  value: V,
  disabled?: boolean,
  required?: boolean,
): TemplateResult => {
  switch (field.type) {
    case 'boolean':
      return html`
        <time-shift-switch
          ?disabled=${disabled}
          ?required=${required}
          label="${field.label}"
          name="${ifDefined(name)}"
          placeholder="${ifDefined(field.placeholder)}"
          .value="${live(value)}"
        ></time-shift-switch>
      `;
    case 'string':
      return html`
        <time-shift-input-text
          ?disabled=${disabled}
          ?required=${required}
          label="${field.label}"
          name="${ifDefined(name)}"
          placeholder="${ifDefined(field.placeholder)}"
          .value="${live(value)}"
        ></time-shift-input-text>
      `;
    default:
      return html`${nothing}`;
  }
};

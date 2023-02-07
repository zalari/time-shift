import type { AdapterField, AdapterFields, AdapterValues } from '@time-shift/common';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import styles from './field-editors.component.scss';

@customElement('time-shift-field-editors')
export class FieldEditors extends LitElement {
  static override readonly styles = unsafeCSS(styles);
  static readonly formAssociated = true;

  @queryAll('time-shift-field-editor')
  readonly elements!: NodeListOf<HTMLElementTagNameMap['time-shift-field-editor']>;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Object })
  fields!: AdapterFields;

  @property({ type: Object })
  values?: AdapterValues<typeof this.fields>;

  checkWhenField(when: AdapterField['when']): boolean {
    if (when === undefined) return true;
    return Object.entries(when).every(([name, value]) => this.values?.[name] === value);
  }

  render() {
    return html`
      ${map(
        Object.entries(this.fields),
        ([name, field]) =>
          html`
            ${when(
              this.checkWhenField(field.when),
              () => html`
                <time-shift-field-editor
                  required
                  ?disabled="${this.disabled}"
                  name="${name}"
                  type="${field.type}"
                  label="${field.label}"
                  message="${ifDefined(field.description)}"
                  placeholder="${ifDefined(field.placeholder)}"
                  .fields="${ifDefined(field.fields)}"
                  .options="${ifDefined(field.options)}"
                  .value="${typeof this.values?.[name] === 'object'
                    ? { ...((this.values?.[name] as {}) ?? {}) }
                    : this.values?.[name]}"
                ></time-shift-field-editor>
              `,
            )}
          `,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-field-editors': FieldEditors;
  }
}

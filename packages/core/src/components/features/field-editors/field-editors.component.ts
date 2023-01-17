import type { AdapterListFields, AdapterListValues } from '@time-shift/common';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, queryAll, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';

import type { SelectOption } from '../../ui/input/select.component';
import type { EventWithTarget } from '../../../utils/type.utils';

import styles from './field-editors.component.scss';

@customElement('time-shift-field-editors')
export class FieldEditors extends LitElement {
  static override readonly styles = unsafeCSS(styles);
  static readonly formAssociated = true;

  @queryAll('time-shift-field-editor')
  readonly elements!: NodeListOf<HTMLElementTagNameMap['time-shift-field-editor']>;

  @state()
  selectedFieldName?: string;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Object })
  fields!: AdapterListFields;

  @property({ type: Object })
  values: AdapterListValues<AdapterListFields> = {};

  @property({ type: String, reflect: true })
  addLabel = 'Add filter';

  @property({ type: String, reflect: true })
  removeLabel = 'Remove filter';

  @property({ type: String, reflect: true })
  selectLabel = 'Select filter';

  emitInputEvent() {
    const event = new Event('input', { bubbles: true, composed: true, cancelable: true });
    requestAnimationFrame(() => this.dispatchEvent(event));
  }

  getFilterOptions(): SelectOption<string>[] {
    return Object.entries(this.fields)
      .filter(([name]) => !(name in this.values))
      .map(([name, field]) => ({
        value: name,
        label: field.label,
      }));
  }

  @eventOptions({ passive: true })
  handleFilterSelect({ target }: EventWithTarget<HTMLSelectElement>) {
    this.selectedFieldName = target.value;
  }

  @eventOptions({ passive: true })
  handleFilterAdd() {
    this.values[this.selectedFieldName!] = undefined as any;
    this.selectedFieldName = undefined;
    this.emitInputEvent();
  }

  @eventOptions({ passive: true })
  handleFilterRemove(event: EventWithTarget) {
    const name = event.target.parentElement!.dataset.name!;
    if (!confirm(`${this.removeLabel} "${this.fields[name].label}"?`)) return;
    const { [name]: _, ...values } = this.values;
    this.values = values;
    this.emitInputEvent();
  }

  render() {
    return html`
      <header>
        <time-shift-select
          include-empty-option
          placeholder="${this.selectLabel}"
          .primitive="${String}"
          .options="${this.getFilterOptions()}"
          .value="${this.selectedFieldName}"
          @input="${this.handleFilterSelect}"
        ></time-shift-select>
        <time-shift-button
          ?disabled="${this.selectedFieldName === undefined}"
          @click="${this.handleFilterAdd}"
        >
          ${this.addLabel}
        </time-shift-button>
      </header>
      <ul>
        ${map(
          Object.entries(this.values),
          ([name, value]) =>
            html`
              <li data-name="${name}">
                <time-shift-field-editor
                  ?required="${this.fields[name].type !== 'boolean'}"
                  ?disabled="${this.disabled}"
                  name="${name}"
                  type="${this.fields[name].type}"
                  label="${this.fields[name].label}"
                  message="${ifDefined(this.fields[name].description)}"
                  placeholder="${ifDefined(this.fields[name].placeholder)}"
                  .value="${value}"
                ></time-shift-field-editor>
                <time-shift-button @click="${this.handleFilterRemove}">${this.removeLabel}</time-shift-button>
              </li>
            `,
        )}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-field-editors': FieldEditors;
  }
}

import type { AdapterFields, AdapterValues } from '@time-shift/common';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, queryAll, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import type { SelectOption } from '../../ui/input/select.component';
import { getFieldByName } from '../../../utils/form.utils';
import type { EventWithTarget } from '../../../utils/type.utils';

import styles from './group-editor.component.scss';

@customElement('time-shift-group-editor')
export class GroupEditor<F extends AdapterFields = any> extends LitElement {
  static override readonly styles = unsafeCSS(styles);
  static readonly formAssociated = true;

  @queryAll('time-shift-field-editor')
  readonly elements!: NodeListOf<HTMLElementTagNameMap['time-shift-field-editor']>;

  @state()
  selectedFieldName?: keyof F;

  @property({ type: String, reflect: true })
  name!: string;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Object })
  fields?: F;

  @property({ type: Object })
  values: Partial<AdapterValues<F>> = {};

  @property({ type: String, reflect: true, attribute: 'add-label' })
  addLabel = 'Add field';

  @property({ type: String, reflect: true, attribute: 'remove-label' })
  removeLabel = 'Remove field';

  @property({ type: String, reflect: true, attribute: 'select-label' })
  selectLabel = 'Select field';

  emitInputEvent() {
    const event = new Event('input', { bubbles: true, composed: true, cancelable: true });
    requestAnimationFrame(() => this.dispatchEvent(event));
  }

  getFieldOptions(): SelectOption<string>[] {
    return Object.entries(this.fields ?? {})
      .filter(([name, { multiple = false }]) => multiple || !(name in this.values))
      .map(([name, field]) => ({
        value: name,
        label: field.label,
      }));
  }

  addEmptyValue(name: keyof F) {
    // TODO: nest group values
    if (name in this.values) {
      let values = this.values[name];
      if (Array.isArray(values)) {
        this.values = { ...this.values, [name]: [...values, undefined] };
      } else {
        this.values = { ...this.values, [name]: [values, undefined] };
      }
    } else this.values = { ...this.values, [name]: undefined };
  }

  @eventOptions({ passive: true })
  handleFieldSelect({ target }: EventWithTarget<HTMLSelectElement>) {
    // apply currently selected filter selection
    this.selectedFieldName = target.value;
  }

  @eventOptions({ passive: true })
  handleFieldAdd() {
    // add an empty value
    this.addEmptyValue(this.selectedFieldName!);

    // reset filter selection
    this.selectedFieldName = undefined;

    // trigger form input event
    this.emitInputEvent();
  }

  @eventOptions({ passive: true })
  handleFieldRemove(event: EventWithTarget) {
    const name = event.target.parentElement!.dataset.name!;
    const index = Number(event.target.parentElement!.dataset.index!);
    const values = this.values[name];
    const hasMultiple = this.fields?.[name].multiple && Array.isArray(values);
    const question = hasMultiple
      ? `Remove "${this.fields?.[name].label}" (${index + 1})?`
      : `Remove "${this.fields?.[name].label}"?`;
    if (!confirm(question)) return;
    const { [name]: value, ...remaining } = this.values;
    if (hasMultiple) {
      const filtered = values.filter((_, i) => i !== index);
      const result = filtered.length > 0 ? { ...remaining, [name]: filtered } : remaining;
      this.values = result as Partial<AdapterValues<F>>;
    } else {
      this.values = remaining as Partial<AdapterValues<F>>;
    }
    this.emitInputEvent();
  }

  @eventOptions({ passive: true })
  handleReloadFields() {
    this.dispatchEvent(new CustomEvent('time-shift-group-editor:reload-fields'));
  }

  renderField(name: string, index: number, value: any) {
    const field = getFieldByName(name, this.fields!);
    return html`
      <li data-name="${name}" data-index="${index}">
        <time-shift-field-editor
          ?required="${ifDefined(field?.type !== 'boolean')}"
          ?disabled="${this.disabled}"
          name="${name}"
          type="${ifDefined(field?.type)}"
          label="${ifDefined(field?.label)}"
          message="${ifDefined(field?.description)}"
          placeholder="${ifDefined(field?.placeholder)}"
          .fields="${ifDefined(field?.fields)}"
          .options="${ifDefined(field?.options)}"
          .value="${value}"
          @input="${ifDefined(field?.reloadOnChange ? this.handleReloadFields : undefined)}"
        ></time-shift-field-editor>
        <time-shift-button @click="${this.handleFieldRemove}">
          ${this.removeLabel}
        </time-shift-button>
      </li>
    `;
  }

  render() {
    return html`
      ${when(
        this.fields !== undefined,
        () => html`
          <header>
            <time-shift-select
              include-empty-option
              placeholder="${this.selectLabel}"
              .primitive="${String}"
              .options="${this.getFieldOptions()}"
              .value="${this.selectedFieldName}"
              @input="${this.handleFieldSelect}"
            ></time-shift-select>
            <time-shift-button
              ?disabled="${this.selectedFieldName === undefined}"
              @click="${this.handleFieldAdd}"
            >
              ${this.addLabel}
            </time-shift-button>
          </header>
          <ul>
            ${map(
              Object.entries(this.values),
              ([name, values]) =>
                html`
                  ${map(
                    this.fields?.[name]?.multiple && Array.isArray(values) ? values : [values],
                    (value, index) => this.renderField(name, index, value),
                  )}
                `,
            )}
          </ul>
        `,
      )}
    `;
  }
}

declare global {
  interface HTMLElementEventMap {
    'time-shift-group-editor:reload-fields': CustomEvent;
  }
  interface HTMLElementTagNameMap {
    'time-shift-group-editor': GroupEditor;
  }
}

import type { AdapterFields, AdapterValues } from '@time-shift/common';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, queryAll, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import type { SelectOption } from '../../ui/input/select.component';
import type { EventWithTarget } from '../../../utils/type.utils';

import styles from './group-editor.component.scss';

@customElement('time-shift-group-editor')
export class GroupEditor<F extends AdapterFields = any> extends LitElement {
  static override readonly styles = unsafeCSS(styles);
  static readonly formAssociated = true;

  @queryAll('time-shift-field-editor')
  readonly fieldEditors!: NodeListOf<HTMLElementTagNameMap['time-shift-field-editor']>;

  @state()
  selectedFieldName?: keyof F;

  @property({ type: String, reflect: true })
  name!: string;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Object })
  fields?: F;

  @property({ type: Object })
  value?: Partial<AdapterValues<F>> = {};

  @property({ type: String, reflect: true, attribute: 'add-label' })
  addLabel = 'Add field';

  @property({ type: String, reflect: true, attribute: 'remove-label' })
  removeLabel = 'Remove field';

  @property({ type: String, reflect: true, attribute: 'select-label' })
  selectLabel = 'Select field';

  checkValidity(): boolean {
    return Array.from(this.fieldEditors).every(({ element }) => element.checkValidity());
  }

  emitInputEvent() {
    const event = new Event('input', { bubbles: true, composed: true, cancelable: true });
    requestAnimationFrame(() => this.dispatchEvent(event));
  }

  emitReloadFieldsEvent() {
    this.dispatchEvent(new CustomEvent('time-shift-group-editor:reload-fields'));
  }

  isOptionVisible(name: string, multiple = false): boolean {
    if (multiple) return true;
    return this.value?.[name as keyof F] === undefined;
  }

  getFieldOptions(): SelectOption<string>[] {
    return Object.entries(this.fields ?? {})
      .filter(([name, { multiple = false }]) => this.isOptionVisible(name, multiple))
      .map(([name, field]) => ({ value: name, label: field.label }));
  }

  addValue(name: keyof F, value?: AdapterValues<F>[typeof name]) {
    if (this.value !== undefined && name in this.value) {
      let values = this.value[name];
      if (Array.isArray(values)) {
        this.value = { ...this.value, [name]: [...values, value] };
      } else if (this.fields?.[name].multiple) {
        this.value = { ...this.value, [name]: [values, value] };
      } else {
        this.value = { ...this.value, [name]: value };
      }
    } else this.value = { ...this.value, [name]: value } as Partial<AdapterValues<F>>;
  }

  setValue(name: string, index: number, value?: AdapterValues<F>[typeof name]) {
    const field = Object.entries(this.fields!).find(([field]) => field === name)?.[1];

    // prepare the value object if missing
    if (this.value === undefined) this.value = {};

    // update the value
    if (field?.multiple) {
      // convert to array if a value is already present
      if (!Array.isArray(this.value[name])) {
        (this.value[name] as any) = [this.value[name]];
      }
      // set the updated value at the given index
      (this.value as any)[name][index] = value;
    } else {
      // set the updated value directly if single or not multiple
      (this.value as any)[name] = value;
    }
  }

  @eventOptions({ passive: true })
  handleFieldSelect({ target }: EventWithTarget<HTMLSelectElement>) {
    // apply currently selected filter selection
    this.selectedFieldName = target.value;
  }

  @eventOptions({ passive: true })
  handleFieldAdd() {
    // add an empty value
    this.addValue(this.selectedFieldName!, undefined);

    // reset filter selection
    this.selectedFieldName = undefined;

    // trigger form input event
    this.emitInputEvent();
  }

  @eventOptions({ passive: true })
  handleFieldRemove(event: EventWithTarget) {
    if (this.value === undefined) return;
    const name = event.target.parentElement!.dataset.name!;
    const index = Number(event.target.parentElement!.dataset.index!);
    const values = this.value[name];
    const hasMultiple = this.fields?.[name].multiple && Array.isArray(values);
    const question = hasMultiple
      ? `Remove "${this.fields?.[name].label}" (${index + 1})?`
      : `Remove "${this.fields?.[name].label}"?`;
    if (!confirm(question)) return;
    const { [name]: value, ...remaining } = this.value;
    if (hasMultiple) {
      const filtered = values.filter((_, i) => i !== index);
      const result = filtered.length > 0 ? { ...remaining, [name]: filtered } : remaining;
      this.value = result as Partial<AdapterValues<F>>;
    } else {
      this.value = remaining as Partial<AdapterValues<F>>;
    }
    this.emitInputEvent();
  }

  @eventOptions({ passive: true })
  handleFieldInput(event: EventWithTarget<HTMLElementTagNameMap['time-shift-field-editor']>) {
    // stop event propagation to update the value first
    event.stopPropagation();

    // grab references
    const { name, dataset, element } = event.target;
    const index = Number(dataset.index);
    const field = Object.entries(this.fields!).find(([field]) => field === name)?.[1];

    // update the value
    this.setValue(name, index, element.value);

    // trigger input event to proceed with actual value
    this.emitInputEvent();

    // reload fields if reloadOnChange is set
    if (field?.reloadOnChange) {
      this.emitReloadFieldsEvent();
    }
  }

  renderField(name: string, index: number, value: any) {
    const field = Object.entries(this.fields!).find(([field]) => field === name)?.[1];
    return html`
      <li data-name="${name}" data-index="${index}">
        <time-shift-field-editor
          ?disabled="${this.disabled}"
          ?required="${field?.required ?? field?.type !== 'boolean'}"
          name="${name}"
          type="${ifDefined(field?.type)}"
          label="${ifDefined(field?.label)}"
          message="${ifDefined(field?.description)}"
          placeholder="${ifDefined(field?.placeholder)}"
          data-index="${index}"
          .fields="${ifDefined(field?.fields)}"
          .options="${ifDefined(field?.options)}"
          .value="${value}"
          @input="${this.handleFieldInput}"
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
              Object.entries(this.value ?? {}),
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

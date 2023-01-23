import {
  type AdapterFields,
  type AdapterSet,
  getAdapter,
  getAdapterNames,
} from '@time-shift/common';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import type { Connection } from '../../../data/connection.data';
import {
  checkFormValidity,
  collectDataFromElements,
  getFormElements,
} from '../../../utils/form.utils';

import type { SelectOption } from '../../ui/input/select.component';

import styles from './connection-edit.component.scss';

type ConnectionData = Omit<Connection, 'id'>;

@customElement('time-shift-connection-edit')
export class ConnectionEdit extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @query('form')
  readonly form!: HTMLFormElement;

  @query('time-shift-connection-test')
  readonly connectionTest!: HTMLElementTagNameMap['time-shift-connection-test'];

  @state()
  formValid = false;

  @state()
  adapterOptions: SelectOption<string>[] = getAdapterNames()
    .sort((a, b) => a.localeCompare(b))
    .map(name => ({
      label: name,
      value: name,
    }));

  @state()
  selectedAdapter?: AdapterSet<AdapterFields, AdapterFields>;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String, reflect: true })
  label = 'Save';

  @property()
  data?: ConnectionData;

  @eventOptions({ passive: true })
  handleFormInput() {
    this.data = this.collectData();
    this.selectedAdapter = this.data?.type ? getAdapter(this.data?.type) : undefined;
    this.formValid = checkFormValidity(this.form);
    this.connectionTest.reset();
  }

  @eventOptions({ passive: true })
  handleFormSubmit(event: Event) {
    event.preventDefault();
    this.formValid = checkFormValidity(this.form);
    if (!this.formValid) return;
    this.emitSaveEvent(this.data!);
  }

  @eventOptions({ passive: true })
  handleSetData({ detail }: CustomEvent<ConnectionData>) {
    this.data = detail;
    this.formValid = checkFormValidity(this.form);
  }

  checkWhenField(when?: Record<string, string | number | boolean>): boolean {
    if (when === undefined) return true;
    return Object.entries(when).every(([name, value]) => this.data?.config[name] === value);
  }

  collectData(): ConnectionData {
    const elements = getFormElements(this.form);
    const dataNames = ['name', 'type'];
    const dataElements = elements.filter(({ name }) => dataNames.includes(name!));
    const configElements = elements.filter(({ name }) => !dataNames.includes(name!));
    const data = collectDataFromElements(dataElements);
    const config = collectDataFromElements(configElements);

    return { ...data, config } as ConnectionData;
  }

  emitSaveEvent(detail: ConnectionData) {
    this.dispatchEvent(new CustomEvent('connection-edit:save-data', { detail }));
  }

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('connection-edit:set-data', this.handleSetData, false);
    this.selectedAdapter = this.data?.type ? getAdapter(this.data?.type) : undefined;
  }

  override firstUpdated() {
    // wait for form elements to be rendered as well
    requestAnimationFrame(() => {
      this.formValid = checkFormValidity(this.form);
    });
  }

  override disconnectedCallback() {
    this.removeEventListener('connection-edit:set-data', this.handleSetData, false);
    super.disconnectedCallback();
  }

  render() {
    return html`
      <form
        ?disabled="${this.disabled}"
        @input="${this.handleFormInput}"
        @submit="${this.handleFormSubmit}"
      >
        <time-shift-fieldset>
          <time-shift-select
            include-empty-option
            required
            label="Adapter"
            name="type"
            placeholder="Select an adapter"
            ?disabled="${this.disabled}"
            .primitive="${String}"
            .options="${this.adapterOptions}"
            validate-on="input blur"
            value="${ifDefined(this.data?.type)}"
          ></time-shift-select>
          <time-shift-input-text
            required
            ?disabled="${this.disabled}"
            label="Name"
            name="name"
            validate-on="input blur"
            value="${ifDefined(this.data?.name)}"
          ></time-shift-input-text>
        </time-shift-fieldset>

        <time-shift-fieldset ?disabled="${this.selectedAdapter === undefined}">
          ${when(
            this.selectedAdapter !== undefined,
            () => html`
              ${map(
                Object.entries(this.selectedAdapter!.config),
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
                          .options="${'values' in field ? field.values : []}"
                          .value="${this.data?.config[name as keyof ConnectionData]}"
                        ></time-shift-field-editor>
                      `,
                    )}
                  `,
              )}
            `,
          )}
        </time-shift-fieldset>

        <time-shift-actions>
          <time-shift-button type="submit" ?disabled="${!this.formValid}"
            >${this.label}</time-shift-button
          >
          <slot name="actions"></slot>
          <slot name="actions:end" slot="end"></slot>
          <time-shift-connection-test
            slot="end"
            ?disabled="${!this.formValid}"
            .data="${this.data}"
          >
            Test connection
          </time-shift-connection-test>
        </time-shift-actions>
      </form>
    `;
  }
}

declare global {
  interface ElementEventMap {
    'connection-edit:save-data': CustomEvent<ConnectionData>;
    'connection-edit:set-data': CustomEvent<ConnectionData>;
  }
  interface HTMLElementTagNameMap {
    'time-shift-connection-edit': ConnectionEdit;
  }
}

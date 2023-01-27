import { type AdapterFields, getAdapter, AdapterTimeEntryFieldsResponse } from '@time-shift/common';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';

import { type Query } from '../../../data/query.data';
import { type Connection, getAllConnections, getConnection } from '../../../data/connection.data';
import {
  checkFormValidity,
  collectDataForNames,
  getFormElements,
} from '../../../utils/form.utils';

import type { SelectOption } from '../../ui/input/select.component';

import styles from './query-edit.component.scss';

type QueryData = Omit<Query, 'id'>;

@customElement('time-shift-query-edit')
export class QueryEdit extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @query('form')
  readonly form!: HTMLFormElement;

  @state()
  formValid = false;

  @state()
  connections: SelectOption<number>[] = [];

  @state()
  selectedSource?: Connection;

  @state()
  queryFields?: AdapterFields;

  @state()
  noteMappingFields?: AdapterFields;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String, reflect: true })
  label = 'Save';

  @property()
  data?: QueryData;

  getConnectionOptions(...exclude: Array<number | undefined>): typeof this.connections {
    return this.connections
      .filter(({ value }) => !exclude.includes(value))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  async prepareConnectionOptions(): Promise<typeof this.connections> {
    const connections = await getAllConnections();
    return connections.map(({ name, id, type }) => ({ value: id, label: `${name} (${type})` }));
  }

  async selectConnection(id?: number): Promise<Connection | undefined> {
    if (id === undefined) return undefined;
    return getConnection(id);
  }

  async getFields(
    connection?: Connection,
  ): Promise<AdapterTimeEntryFieldsResponse<AdapterFields, AdapterFields>> {
    if (!connection?.type) {
      return { queryFields: {}, noteMappingFields: {} };
    }
    const adaper = await getAdapter(connection?.type).adapter(connection.config);
    return adaper.getTimeEntryFields();
  }

  @eventOptions({ passive: true })
  async handleFormInput() {
    this.data = this.collectData();
    this.selectedSource = await this.selectConnection(this.data?.source);
    const { queryFields, noteMappingFields } = await this.getFields(this.selectedSource);
    this.queryFields = queryFields;
    this.noteMappingFields = noteMappingFields;
    this.formValid = checkFormValidity(this.form);
  }

  @eventOptions({ passive: true })
  handleFormSubmit(event: Event) {
    event.preventDefault();
    this.formValid = checkFormValidity(this.form);
    if (!this.formValid) return;
    this.emitSaveEvent(this.data!);
  }

  @eventOptions({ passive: true })
  handleSetData({ detail }: CustomEvent<QueryData>) {
    this.data = detail;
    this.formValid = checkFormValidity(this.form);
  }

  collectData(): QueryData {
    const elements = getFormElements(this.form);

    const data = collectDataForNames(elements, ['name', 'source']);
    const filters = collectDataForNames(elements, Object.keys(this.queryFields ?? {}));
    const mapping = collectDataForNames(elements, Object.keys(this.noteMappingFields ?? {}));

    return { ...data, filters, mapping } as QueryData;
  }

  emitSaveEvent(detail: QueryData) {
    this.dispatchEvent(new CustomEvent('query-edit:save-data', { detail }));
  }

  override async connectedCallback() {
    super.connectedCallback();
    this.addEventListener('query-edit:set-data', this.handleSetData, false);

    this.connections = await this.prepareConnectionOptions();
    this.selectedSource = await this.selectConnection(this.data?.source);
    const { queryFields, noteMappingFields } = await this.getFields(this.selectedSource);
    this.queryFields = queryFields;
    this.noteMappingFields = noteMappingFields;
  }

  override firstUpdated() {
    // wait for form elements to be rendered as well
    requestAnimationFrame(() => {
      this.formValid = checkFormValidity(this.form);
    });
  }

  override disconnectedCallback() {
    this.removeEventListener('query-edit:set-data', this.handleSetData, false);
    super.disconnectedCallback();
  }

  render() {
    return html`
      <form
        ?disabled="${this.disabled}"
        @input="${this.handleFormInput}"
        @submit="${this.handleFormSubmit}"
      >
        ${when(
          this.connections.length > 0,
          () => html`
            <time-shift-fieldset>
              <time-shift-input-text
                required
                ?disabled="${this.disabled}"
                label="Name"
                name="name"
                validate-on="input blur"
                .value="${this.data?.name}"
              ></time-shift-input-text>
            </time-shift-fieldset>

            <time-shift-fieldset legend="Source">
              <time-shift-select
                include-empty-option
                required
                label="Source connection"
                name="source"
                placeholder="Select a connection"
                validate-on="input blur"
                ?disabled="${this.disabled}"
                .primitive="${Number}"
                .options="${this.getConnectionOptions()}"
                .value="${this.data?.source}"
              ></time-shift-select>
            </time-shift-fieldset>

            ${when(
              this.queryFields !== undefined,
              () => html`
                <time-shift-fieldset legend="Filters">
                  <time-shift-filter-fields
                    .fields="${this.queryFields!}"
                    .values="${ifDefined(this.data?.filters)}"
                  ></time-shift-filter-fields>
                </time-shift-fieldset>
              `,
            )}
            ${when(
              this.noteMappingFields !== undefined,
              () => html`
                <time-shift-fieldset legend="Note mapping">
                  <time-shift-filter-fields
                    .fields="${this.noteMappingFields!}"
                    .values="${ifDefined(this.data?.mapping)}"
                  ></time-shift-filter-fields>
                </time-shift-fieldset>
              `,
            )}

            <time-shift-actions>
              <time-shift-button type="submit" ?disabled="${!this.formValid}">
                ${this.label}
              </time-shift-button>
              <slot name="actions"></slot>
              <slot name="actions:end" slot="end"></slot>
            </time-shift-actions>
          `,
          () => html`
            <p>
              No connections found. Please <a href="/settings/connection/new">a connection</a> from
              the available adapters first.
            </p>
          `,
        )}
      </form>
    `;
  }
}

declare global {
  interface ElementEventMap {
    'query-edit:save-data': CustomEvent<QueryData>;
    'query-edit:set-data': CustomEvent<QueryData>;
  }
  interface HTMLElementTagNameMap {
    'time-shift-query-edit': QueryEdit;
  }
}

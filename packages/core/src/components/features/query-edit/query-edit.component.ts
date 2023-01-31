import { type AdapterFields, getAdapter } from '@time-shift/common';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, query, queryAll, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';

import { type Query } from '../../../data/query.data';
import { type Connection, getAllConnections, getConnection } from '../../../data/connection.data';
import { checkFormValidity, collectDataForNames, getFormElements } from '../../../utils/form.utils';

import type { EditableInterface } from '../../ui/input/input.component.mixin';
import type { SelectOption } from '../../ui/input/select.component';

import styles from './query-edit.component.scss';

type QueryData = Omit<Query, 'id'>;

@customElement('time-shift-query-edit')
export class QueryEdit extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @query('form')
  readonly form!: HTMLFormElement;

  @queryAll('time-shift-fields-editor')
  readonly fieldEditors!: HTMLElementTagNameMap['time-shift-fields-editor'][];

  @state()
  formValid = false;

  @state()
  connections: SelectOption<number>[] = [];

  @state()
  selectedSource?: Connection;

  @state()
  selectedTarget?: Connection;

  @state()
  queryFields?: AdapterFields;

  @state()
  noteMappingFields?: AdapterFields;

  @state()
  loadingQueryAndNoteMappingFields = false;

  @state()
  loadingStrategyFields = false;

  @state()
  strategyFields?: AdapterFields;

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

  async loadQueryAndNoteMappingFields(connection?: Connection) {
    // no connection, no data
    if (!connection?.type) {
      this.queryFields = undefined;
      this.noteMappingFields = undefined;
      return;
    }

    // load fields from adapter
    this.loadingQueryAndNoteMappingFields = true;
    const adaper = await getAdapter(connection?.type).adapter(connection.config);
    const { queryFields, noteMappingFields } = await adaper.getTimeEntryFields(this.data?.filters);

    // update fields
    this.queryFields = queryFields;
    this.noteMappingFields = noteMappingFields;

    // explicitly update filter fields, as the fileds may have changed
    this.fieldEditors.forEach(filterFields => filterFields.requestUpdate());
    this.loadingQueryAndNoteMappingFields = false;
  }

  async loadStrategyFields(connection?: Connection) {
    // no connection, no data
    if (!connection?.type) {
      this.strategyFields = undefined;
      return;
    }

    // load fields from adapter
    this.loadingStrategyFields = true;
    const adaper = await getAdapter(connection?.type).adapter(connection.config);
    this.strategyFields = await adaper.getStrategyFields(connection.type);
    this.loadingStrategyFields = false;
  }

  collectData(): QueryData {
    const elements = getFormElements(this.form);

    const data = collectDataForNames(elements, ['name', 'source', 'target']);
    const filters = collectDataForNames(elements, Object.keys(this.queryFields ?? {}));
    const mapping = collectDataForNames(elements, Object.keys(this.noteMappingFields ?? {}));
    const strategy = collectDataForNames(elements, Object.keys(this.strategyFields ?? {}));

    return { ...data, filters, mapping, strategy } as QueryData;
  }

  emitSaveEvent(detail: QueryData) {
    this.dispatchEvent(new CustomEvent('query-edit:save-data', { detail }));
  }

  @eventOptions({ passive: true, capture: true })
  async handleSourceChange(event: Event) {
    // do not bubble up, we'll handle this here
    event.stopPropagation();

    // collect the selected source, prepare a connection and (re)load fields
    const { nativeInput } = event.target as unknown as EditableInterface<number>;
    this.selectedSource = await this.selectConnection(Number(nativeInput.value));
    this.loadQueryAndNoteMappingFields(this.selectedSource);
  }

  @eventOptions({ passive: true, capture: true })
  async handleTargetChange(event: Event) {
    // do not bubble up, we'll handle this here
    event.stopPropagation();

    // collect the selected source, prepare a connection and (re)load fields
    const { nativeInput } = event.target as unknown as EditableInterface<number>;
    this.selectedTarget = await this.selectConnection(Number(nativeInput.value));
    this.loadStrategyFields(this.selectedTarget);
  }

  @eventOptions({ passive: true })
  async handleReloadQueryAndNoteMappingFields() {
    // collect latest data snapshot and (re)load fields
    this.data = this.collectData();
    this.loadQueryAndNoteMappingFields(this.selectedSource);
  }

  @eventOptions({ passive: true })
  async handleReloadStrategyFields() {
    // collect latest data snapshot and (re)load fields
    this.data = this.collectData();
    this.loadStrategyFields(this.selectedTarget);
  }

  @eventOptions({ passive: true })
  async handleFormInput() {
    this.data = this.collectData();
    this.selectedSource = await this.selectConnection(this.data?.source);
    this.selectedTarget = await this.selectConnection(this.data?.target);
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

  override async connectedCallback() {
    super.connectedCallback();
    this.addEventListener('query-edit:set-data', this.handleSetData, false);

    // load connections initially
    this.connections = await this.prepareConnectionOptions();
    this.selectedSource = await this.selectConnection(this.data?.source);
    this.selectedTarget = await this.selectConnection(this.data?.target);

    // load fields initially
    this.loadQueryAndNoteMappingFields(this.selectedSource);
    this.loadStrategyFields(this.selectedTarget);
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
                @input="${this.handleSourceChange}"
              ></time-shift-select>
            </time-shift-fieldset>

            ${when(
              this.queryFields !== undefined,
              () => html`
                <time-shift-fieldset
                  legend="Filters"
                  description="Allows to narrow the results initially."
                >
                  <time-shift-fields-editor
                    .fields="${this.queryFields!}"
                    .values="${ifDefined(this.data?.filters)}"
                    ?disabled="${this.loadingQueryAndNoteMappingFields}"
                    @time-shift-fields-editor:reload-fields="${this
                      .handleReloadQueryAndNoteMappingFields}"
                  ></time-shift-fields-editor>
                </time-shift-fieldset>
              `,
            )}
            ${when(
              this.noteMappingFields !== undefined,
              () => html`
                <time-shift-fieldset
                  legend="Note mapping"
                  description="Next to the notes provided by the source, a generated note can be created by the fields defined here."
                >
                  <time-shift-fields-editor
                    .fields="${this.noteMappingFields!}"
                    .values="${ifDefined(this.data?.mapping)}"
                  ></time-shift-fields-editor>
                </time-shift-fieldset>
              `,
            )}

            <time-shift-fieldset legend="Target">
              <time-shift-select
                include-empty-option
                required
                label="Target connection"
                name="target"
                placeholder="Select a connection"
                validate-on="input blur"
                ?disabled="${this.disabled}"
                .primitive="${Number}"
                .options="${this.getConnectionOptions()}"
                .value="${this.data?.target}"
                @input="${this.handleTargetChange}"
              ></time-shift-select>
            </time-shift-fieldset>

            ${when(
              this.strategyFields !== undefined,
              () => html`
                <time-shift-fieldset
                  legend="Strategy"
                  description="Choose a mapping strategy from the target adapter."
                >
                  <time-shift-fields-editor
                    .fields="${this.strategyFields!}"
                    .values="${ifDefined(this.data?.strategy)}"
                    ?disabled="${this.loadingStrategyFields}"
                    @time-shift-fields-editor:reload-fields="${this.handleReloadStrategyFields}"
                  ></time-shift-fields-editor>
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
  interface HTMLElementEventMap {
    'query-edit:save-data': CustomEvent<QueryData>;
    'query-edit:set-data': CustomEvent<QueryData>;
  }
  interface HTMLElementTagNameMap {
    'time-shift-query-edit': QueryEdit;
  }
}

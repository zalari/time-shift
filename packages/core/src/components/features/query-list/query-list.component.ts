import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import { Database } from '../../../utils/database.utils';

import { Connection, getConnection } from '../../../data/connection.data';
import { type Query, getAllQuerys } from '../../../data/query.data';

import styles from './query-list.component.scss';

type NormalizedQuery = Omit<Query, 'source'> & {
  source: Connection | undefined;
};

@customElement('time-shift-query-list')
export class QueryList extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @state()
  queries: NormalizedQuery[] = [];

  @property({ type: String, reflect: true, attribute: 'action-label' })
  actionLabel?: string;

  @property({ type: String, reflect: true })
  base = '';

  constructor() {
    super();
    window.addEventListener('complete', event => {});
  }

  async getConnection(id: Connection['id']): Promise<Connection | undefined> {
    return await getConnection(id);
  }

  async getQuerys() {
    const queries = await getAllQuerys();
    this.queries = await Promise.all(
      queries
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(async query => {
          const source = await this.getConnection(query.source);
          return { ...query, source };
        }),
    );
  }

  @eventOptions({ passive: false })
  handleAction(event: Event) {
    event.preventDefault();
    const { id } = (event.target as HTMLElement).dataset;
    const action = new CustomEvent('time-shift-query-list:action', { detail: Number(id) });
    this.dispatchEvent(action);
  }

  override connectedCallback() {
    super.connectedCallback();
    Database.Event.addListener('connection:updated', this.getQuerys.bind(this));
    Database.Event.addListener('queries:changed', this.getQuerys.bind(this));
    this.getQuerys();
  }

  override disconnectedCallback() {
    Database.Event.removeListener('connection:updated', this.getQuerys.bind(this));
    Database.Event.removeListener('queries:changed', this.getQuerys.bind(this));
    super.disconnectedCallback();
  }

  render() {
    return html`
      <time-shift-nav-items empty="No queries found.">
        ${map(
          this.queries,
          ({ name, source, id }) => html`
            <time-shift-nav-item
              href="${this.base}/${id}"
              label="${name}"
              description="${source!.name} (${source!.type})"
            >
              ${when(
                this.actionLabel,
                () => html`
                  <time-shift-button slot="actions" data-id="${id}" @click="${this.handleAction}">
                    ${this.actionLabel}
                  </time-shift-button>
                `,
              )}
            </time-shift-nav-item>
          `,
        )}
      </time-shift-nav-items>
    `;
  }
}

declare global {
  interface HTMLElementEventMap {
    'time-shift-query-list:action': CustomEvent<number>;
  }
  interface HTMLElementTagNameMap {
    'time-shift-query-list': QueryList;
  }
}

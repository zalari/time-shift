import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

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
            ></time-shift-nav-item>
          `,
        )}
      </time-shift-nav-items>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-query-list': QueryList;
  }
}

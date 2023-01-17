import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import { Connection, getConnection } from '../../../data/connection.data';
import { type Query, getAllQuerys } from '../../../data/query.data';

import { Database } from '../../../utils/database.utils';
import { toggleActive } from '../../../utils/router.utils';

import styles from './query-list.component.scss';

type NormalizedQuery = Omit<Query, 'source'> & {
  source: Connection | undefined;
};

@customElement('time-shift-query-list')
export class QueryList extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  readonly connections = new Map<Connection['id'], Connection>();

  @state()
  queries: NormalizedQuery[] = [];

  @property({ type: String, reflect: true })
  base = '';

  constructor() {
    super();
    window.addEventListener('complete', event => {});
  }

  async getConnection(id: Connection['id']): Promise<Connection | undefined> {
    const connection = this.connections.get(id) ?? (await getConnection(id));
    this.connections.set(id, connection!);
    return connection;
  }

  async getQuerys() {
    const queries = await getAllQuerys();
    this.queries = await Promise.all(
      queries.map(async query => {
        const source = await this.getConnection(query.source);
        return { ...query, source };
      }),
    );
  }

  override connectedCallback() {
    super.connectedCallback();
    Database.Event.addListener('queries:changed', this.getQuerys.bind(this));
    this.getQuerys();
  }

  override disconnectedCallback() {
    Database.Event.removeListener('queries:changed', this.getQuerys.bind(this));
    super.disconnectedCallback();
  }

  render() {
    return html`
      ${when(
        this.queries.length > 0,
        () => html`
          <ul>
            ${map(
              this.queries,
              ({ name, source, id }) => html`
                <li>
                  <a href="${this.base}/${id}" ${toggleActive('active')}>
                    <strong>${name}</strong>
                    ${when(
                      source !== undefined,
                      () => html`<span>source: ${source!.name} (${source!.type})</span>`,
                    )}
                  </a>
                </li>
              `,
            )}
          </ul>
        `,
        () => html`<p>No queries found.</p>`,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-query-list': QueryList;
  }
}

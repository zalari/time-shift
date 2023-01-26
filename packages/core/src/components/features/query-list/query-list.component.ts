import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import { Database } from '../../../utils/database.utils';
import { navigateTo } from '../../../utils/router.utils';

import { Connection, getConnection } from '../../../data/connection.data';
import { type Query, getAllQuerys, getQuery } from '../../../data/query.data';

import styles from './query-list.component.scss';
import { encodeParamValue } from '../../../utils/url.utils';

type NormalizedQuery = Omit<Query, 'source'> & {
  source: Connection | undefined;
};

@customElement('time-shift-query-list')
export class QueryList extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @state()
  queries: NormalizedQuery[] = [];

  @property({ type: Boolean, reflect: true, attribute: 'disable-clone' })
  disableClone = false;

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
  async handleClone(event: Event) {
    event.preventDefault();
    const query = await getQuery(Number((event.target as HTMLElement).dataset.id!));
    const { id, name, ...entries } = query!;
    const clone = { ...entries!, name: `${name} (Clone)` } satisfies Omit<Query, 'id'>;
    navigateTo(`${this.base}/new/${encodeParamValue(clone)}`);
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
                !this.disableClone,
                () => html`
                  <time-shift-button slot="actions" data-id="${id}" @click="${this.handleClone}">
                    Clone
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
  interface HTMLElementTagNameMap {
    'time-shift-query-list': QueryList;
  }
}

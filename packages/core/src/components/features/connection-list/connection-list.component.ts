import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import { Database } from '../../../utils/database.utils';
import { navigateTo } from '../../../utils/router.utils';
import { encodeParamValue } from '../../../utils/url.utils';
import { type Connection, getAllConnections, getConnection } from '../../../data/connection.data';

import styles from './connection-list.component.scss';

@customElement('time-shift-connection-list')
export class ConnectionList extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @state()
  connections: Connection[] = [];

  @property({ type: Boolean, reflect: true, attribute: 'disable-clone' })
  disableClone = false;

  @property({ type: String, reflect: true })
  base = '';

  constructor() {
    super();
    window.addEventListener('complete', event => {});
  }

  async getConnections() {
    const connections = await getAllConnections();
    this.connections = connections.sort((a, b) =>
      // sort by name AND type
      `${a.name}${a.type}`.localeCompare(`${b.name}${b.type}`),
    );
  }

  @eventOptions({ passive: false })
  async handleClone(event: Event) {
    event.preventDefault();
    const query = await getConnection(Number((event.target as HTMLElement).dataset.id!));
    const { id, name, ...entries } = query!;
    const clone = { ...entries!, name: `${name} (Clone)` } satisfies Omit<Connection, 'id'>;
    navigateTo(`${this.base}/new/${encodeParamValue(clone)}`);
  }

  override connectedCallback() {
    super.connectedCallback();
    Database.Event.addListener('connections:changed', this.getConnections.bind(this));
    this.getConnections();
  }

  override disconnectedCallback() {
    Database.Event.removeListener('connections:changed', this.getConnections.bind(this));
    super.disconnectedCallback();
  }

  render() {
    return html`
      <time-shift-nav-items empty="No connections found.">
        ${map(
          this.connections,
          ({ name, type, id }) => html`
            <time-shift-nav-item
              href="/settings/connection/${id}"
              label="${name}"
              description="${type}"
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
    'time-shift-connection-list': ConnectionList;
  }
}

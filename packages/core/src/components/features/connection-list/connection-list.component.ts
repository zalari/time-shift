import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import { Database } from '../../../utils/database.utils';
import { type Connection, getAllConnections } from '../../../data/connection.data';

import styles from './connection-list.component.scss';

@customElement('time-shift-connection-list')
export class ConnectionList extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @state()
  connections: Connection[] = [];

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
            ></time-shift-nav-item>
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

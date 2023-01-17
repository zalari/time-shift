import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import { Database } from '../../../utils/database.utils';
import { toggleActive } from '../../../utils/router.utils';
import { type Connection, getAllConnections } from '../../../data/connection.data';

import styles from './connection-list.component.scss';

@customElement('time-shift-connection-list')
export class ConnectionList extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @state()
  connections: Connection[] = [];

  constructor() {
    super();
    window.addEventListener('complete', event => {});
  }

  async getConnections() {
    this.connections = await getAllConnections();
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
      ${when(
        this.connections.length > 0,
        () => html`
          <ul>
            ${map(
              this.connections,
              ({ name, type, id }) => html`
                <li>
                  <a href="/settings/connection/${id}" ${toggleActive('active')}>
                    <strong>${name}</strong>
                    <span>${type}</span>
                  </a>
                </li>
              `,
            )}
          </ul>
        `,
        () => html`<p>No connections found.</p>`,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-connection-list': ConnectionList;
  }
}

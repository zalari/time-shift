import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import { type Connection, getAllConnections } from '@/data/connection.data';

import styles from './connection-list.component.scss';
import { addEventListener, removeEventListener } from '@/utils/event.utils';

@customElement('time-shift-connection-list')
export class ConnectionList extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @state()
  connections: Connection[] = [];

  @property({ type: String, reflect: true, attribute: 'action-label' })
  actionLabel?: string;

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
  handleAction(event: Event) {
    event.preventDefault();
    const { id } = (event.target as HTMLElement).dataset;
    const action = new CustomEvent('time-shift-connection-list:action', { detail: Number(id) });
    this.dispatchEvent(action);
  }

  override connectedCallback() {
    super.connectedCallback();
    addEventListener('connections:changed', this.getConnections.bind(this));
    this.getConnections();
  }

  override disconnectedCallback() {
    removeEventListener('connections:changed', this.getConnections.bind(this));
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
    'time-shift-connection-list:action': CustomEvent<number>;
  }
  interface HTMLElementTagNameMap {
    'time-shift-connection-list': ConnectionList;
  }
}

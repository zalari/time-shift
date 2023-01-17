import { LitElement, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';

import { createQuery } from '../../data/query.data';
import { handleNavigation, navigateTo } from '../../utils/router.utils';

@customElement('time-shift-query-new-page')
export class QueryNewPage extends LitElement {
  @state()
  disabled = false;

  @eventOptions({ passive: true })
  async handleSaveData(event: ElementEventMap['query-edit:save-data']) {
    this.disabled = true;
    const id = await createQuery(event.detail);
    navigateTo(`/settings/query/${id}`);
  }

  render() {
    return html`
      <h1>New query</h1>
      <time-shift-query-edit
        label="Create"
        ?disabled="${this.disabled}"
        @query-edit:save-data="${this.handleSaveData}"
      >
        <time-shift-button slot="actions" @click="${handleNavigation('/settings')}">Close</time-shift-button>
        <time-shift-button disabled slot="actions:end">See results</time-shift-button>
      </time-shift-query-edit>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-query-new-page': QueryNewPage;
  }
}

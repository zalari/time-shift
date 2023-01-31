import type { RouterLocation } from '@vaadin/router';
import { LitElement, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';

import { type Query, createQuery } from '../../data/query.data';
import { handleNavigation, navigateTo } from '../../utils/router.utils';
import { decodeParamValue } from '../../utils/url.utils';

@customElement('time-shift-query-new-page')
export class QueryNewPage extends LitElement {
  readonly location!: RouterLocation;

  @state()
  disabled = false;

  @state()
  query?: Query;

  @eventOptions({ passive: true })
  async handleSaveData(event: HTMLElementEventMap['query-edit:save-data']) {
    this.disabled = true;
    const id = await createQuery(event.detail);
    navigateTo(`/settings/query/${id}`);
  }

  override connectedCallback() {
    super.connectedCallback();
    const { prefill } = this.location.params;
    if (prefill !== undefined) {
      this.query = decodeParamValue(prefill as string);
    }
  }

  render() {
    return html`
      <h1>New query</h1>
      <time-shift-query-edit
        label="Create"
        ?disabled="${this.disabled}"
        .data="${this.query}"
        @query-edit:save-data="${this.handleSaveData}"
      >
        <time-shift-button slot="actions" @click="${handleNavigation('/settings')}">
          Close
        </time-shift-button>
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

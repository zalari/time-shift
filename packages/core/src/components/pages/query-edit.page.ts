import type { RouterLocation } from '@vaadin/router';
import { LitElement, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import { handleNavigation, navigateTo } from '../../utils/router.utils';

import { type Query, updateQuery, deleteQuery, getQuery } from '../../data/query.data';

@customElement('time-shift-query-edit-page')
export class QueryEditPage extends LitElement {
  readonly location!: RouterLocation;

  @state()
  disabled = false;

  @state()
  query?: Query;

  @eventOptions({ passive: true })
  async handleSaveData({ detail }: HTMLElementEventMap['query-edit:save-data']) {
    this.disabled = true;
    this.query = { ...detail, id: this.query!.id } as Query;
    await updateQuery(this.query);
    this.disabled = false;
  }

  @eventOptions({ passive: true })
  async handleDelete() {
    this.disabled = true;
    if (confirm(`Delete query "${this.query?.name}"?`)) {
      await deleteQuery(this.query!.id);
      navigateTo('/settings');
    }
    this.disabled = false;
  }

  override async connectedCallback() {
    super.connectedCallback();

    const { id } = this.location.params;
    const query = await getQuery(Number(id));
    this.query = query;
  }

  render() {
    return html`${when(
      this.query !== undefined,
      () => html`
        <h1>Edit query</h1>
        <time-shift-query-edit
          label="Update"
          ?disabled="${this.disabled}"
          .data="${this.query}"
          @query-edit:save-data="${this.handleSaveData}"
        >
          <time-shift-button slot="actions" @click="${handleNavigation('/settings')}">
            Close
          </time-shift-button>
          <time-shift-button slot="actions" @click="${this.handleDelete}">
            Delete
          </time-shift-button>
          <time-shift-button
            slot="actions:end"
            @click="${handleNavigation(`/time-entries/${this.query!.id}`)}"
            ?disabled="${this.query === undefined}"
          >
            See results
          </time-shift-button>
        </time-shift-query-edit>
      `,
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-query-edit-page': QueryEditPage;
  }
}

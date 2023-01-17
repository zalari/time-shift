import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('time-shift-not-found-page')
export class NotFoundPage extends LitElement {
  render() {
    return html`
      <time-shift-layout-main>
        <time-shift-navigation slot="header"></time-shift-navigation>
        <h1>Not found</h1>
      </time-shift-layout-main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-not-found-page': NotFoundPage;
  }
}

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('time-shift-test-form-page')
export class TestFormPage extends LitElement {
  render() {
    return html`
      <time-shift-layout-main>
        <time-shift-navigation slot="header"></time-shift-navigation>
        <h1>Test Page Form</h1>
        <time-shift-test-form></time-shift-test-form>
      </time-shift-layout-main> 
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-test-form-page': TestFormPage;
  }
}

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';

import { setupDb } from '@/utils/database.utils';
import { configureRouter } from '@/utils/router.utils';
import { ROOT_ROUTES } from './root.routes';

setupDb();

@customElement('time-shift-root')
export class Root extends LitElement {
  render() {
    return html`
      <time-shift-wrapper
        ${ref(outlet => configureRouter(ROOT_ROUTES, outlet))}
      ></time-shift-wrapper>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-root': Root;
  }
}

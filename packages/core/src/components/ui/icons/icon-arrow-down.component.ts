import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

@customElement('time-shift-icon-arrow-down')
export class IconArrowDown extends LitElement {
  @property({ reflect: true, type: Number })
  size?: number;

  render() {
    return html`
      <time-shift-icon size="${ifDefined(this.size)}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 8">
          <path
            d="M13 1.41431L7.70711 6.7072C7.31658 7.09773 6.68342 7.09772 6.29289 6.7072L1 1.41431"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </time-shift-icon>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-icon-arrow-down': IconArrowDown;
  }
}

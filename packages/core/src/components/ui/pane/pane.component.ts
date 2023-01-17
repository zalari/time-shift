import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import styles from './pane.component.scss';

@customElement('time-shift-pane')
export class Pane extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: String })
  headline?: string;

  render() {
    return html`
      ${when(
        this.headline !== undefined,
        () => html` <header>
          <h2>${this.headline}</h2>
          <slot name="actions"></slot>
        </header>`,
        () => html`<slot name="actions"></slot>`,
      )}
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-pane': Pane;
  }
}

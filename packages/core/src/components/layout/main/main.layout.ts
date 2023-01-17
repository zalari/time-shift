import { LitElement, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import styles from './main.layout.scss';

@customElement('time-shift-layout-main')
export class MainLayout extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  render() {
    return html`
      <header><slot name="header"></slot></header>
      <div>
        <aside><slot name="aside"></slot></aside>
        <main role="main"><slot></slot></main>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-layout-main': MainLayout;
  }
}

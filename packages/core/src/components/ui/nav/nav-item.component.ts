import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import { toggleActive } from '../../../utils/router.utils';

import styles from './nav-item.component.scss';

@customElement('time-shift-nav-item')
export class NavItem extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: String })
  href!: string;

  @property({ reflect: true, type: String })
  label?: string;

  @property({ reflect: true, type: String })
  description?: string;

  render() {
    return html`
      <a href="${this.href}" ${toggleActive('active')}>
        <strong>${this.label}</strong>
        ${when(this.description !== undefined, () => html`<span>${this.description}</span>`)}
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-nav-item': NavItem;
  }
}

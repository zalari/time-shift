import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { toggleActive } from '../../../utils/router.utils';

import styles from './navigation.component.scss';

@customElement('time-shift-navigation')
export class Navigation extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  render() {
    return html`
      <time-shift-header>
        <span class="title">Time Shift</span>
        <a href="/time-entries" ${toggleActive('active')}>Time entries</a>
        <a href="/settings" ${toggleActive('active')}>Settings</a>
        <a slot="end" href="https://zalari.de" target="_blank">&copy; 2023 Zalari GmbH</a>
      </time-shift-header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-navigation': Navigation;
  }
}

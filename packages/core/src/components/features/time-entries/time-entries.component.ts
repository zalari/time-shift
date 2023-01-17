import type { TimeEntry } from '@time-shift/common';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import styles from './time-entries.component.scss';

@customElement('time-shift-time-entries')
export class TimeEntries extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ type: Array, reflect: true })
  entries: TimeEntry[] = [];

  render() {
    return html`
      <header></header>
      <ul>
        ${map(
          this.entries,
          entry => html`
            <li>
              <span>${entry.at.toLocaleDateString()}</span>
              <span>${entry.minutes}</span>
              <span>${entry.note}</span>
            </li>
          `,
        )}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-time-entries': TimeEntries;
  }
}

import type { TimeEntry } from '@time-shift/common';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import styles from './time-entries.component.scss';

@customElement('time-shift-time-entries')
export class TimeEntries extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ type: String, reflect: true })
  locale: string = 'en';

  @property({ type: Array, reflect: true })
  entries: TimeEntry[] = [];

  readonly dateFormat = new Intl.DateTimeFormat(this.locale, { dateStyle: 'medium' });
  readonly timeFormat = new Intl.RelativeTimeFormat(this.locale, { style: 'short' });

  formatMinutes(minutes: number): string {
    return this.timeFormat
      .formatToParts(minutes, 'minutes')
      .filter((_, index) => index > 0)
      .map(({ value }) => value)
      .join('');
  }

  render() {
    return html`
      <header></header>
      <ul>
        ${map(
          this.entries,
          entry => html`
            <li>
              <span>${this.dateFormat.format(entry.at)}</span>
              <span>${this.formatMinutes(entry.minutes)}</span>
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

import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import { getDurationDecimal, getDurationFormatted } from '../../../utils/time-entry.utils';

import styles from './duration.component.scss';

@customElement('time-shift-duration')
export class Duration extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: String })
  label!: string;

  @property({ reflect: true, type: Number })
  minutes!: number;

  @property({ reflect: true, type: Boolean })
  decimal = false;

  emitDecimalChangedEvent(detail: boolean) {
    const event = new CustomEvent('time-shift-duration:decimal-changed', { detail });
    this.dispatchEvent(event);
  }

  toggleDecimal() {
    this.decimal = !this.decimal;
    this.emitDecimalChangedEvent(this.decimal);
  }

  constructor() {
    super();
    this.addEventListener('click', this.toggleDecimal);
  }

  override disconnectedCallback() {
    this.removeEventListener('click', this.toggleDecimal);
    super.disconnectedCallback();
  }

  render() {
    return html`
      <span class="label">${this.label}</span>
      <span class="value">
        ${when(
          this.decimal,
          () => html`${getDurationDecimal(this.minutes)}`,
          () => html`${getDurationFormatted(this.minutes)}`,
        )}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementEventMap {
    'time-shift-duration:decimal-changed': CustomEvent<boolean>;
  }
  interface HTMLElementTagNameMap {
    'time-shift-duration': Duration;
  }
}

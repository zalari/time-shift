import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { hasCorsProxy, toggleCorsProxy } from '../../../utils/cors.utils';

import styles from './toggle-cors.component.scss';

@customElement('time-shift-toggle-cors')
export class ToggleCors extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @state()
  hasCorsProxy = false;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String, reflect: true, attribute: 'input-name' })
  inputName!: string;

  @property({ type: String, reflect: true })
  label?: string;

  findRelatedInput(element: Element): HTMLInputElement | undefined {
    const input = element.matches(`[name="${this.inputName}"]`)
      ? (element as HTMLInputElement)
      : undefined;
    if (input === undefined && element.parentElement !== null) {
      return this.findRelatedInput(element.parentElement);
    }
    return input;
  }

  @eventOptions({ passive: true })
  async handleRelatedInput() {
    const input = this.findRelatedInput(this.parentElement!);
    if (input === undefined) return;
    this.hasCorsProxy = await hasCorsProxy(input.value ?? '');
  }

  @eventOptions({ capture: true, passive: true })
  async handleInput() {
    const input = this.findRelatedInput(this.parentElement!);
    if (input === undefined) return;
    input.value = await toggleCorsProxy(input.value ?? '');
    this.hasCorsProxy = await hasCorsProxy(input.value ?? '');
  }

  override async connectedCallback() {
    super.connectedCallback();

    const input = this.findRelatedInput(this.parentElement!);
    if (input !== undefined) {
      this.hasCorsProxy = await hasCorsProxy(input.value ?? '');
      input.addEventListener('input', this.handleRelatedInput.bind(this), false);
    }
  }

  override disconnectedCallback() {
    const input = this.findRelatedInput(this.parentElement!);
    if (input !== undefined) {
      input.removeEventListener('input', this.handleRelatedInput.bind(this), false);
    }
    super.disconnectedCallback();
  }

  render() {
    return html`
      <time-shift-switch
        ?disabled="${this.disabled}"
        placeholder="${ifDefined(this.label)}"
        .value="${this.hasCorsProxy}"
        @input="${this.handleInput}"
      ></time-shift-switch>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-toggle-cors': ToggleCors;
  }
}

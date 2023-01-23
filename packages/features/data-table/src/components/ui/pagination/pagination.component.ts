import { html, LitElement, type TemplateResult, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';

import styles from './pagination.component.scss';

@customElement('time-shift-pagination')
export class Pagination extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ reflect: true, type: Number })
  current!: number;

  @property({ reflect: true, type: Number })
  count!: number;

  emitTurnPageEvent(page: number) {
    this.dispatchEvent(new CustomEvent('time-shift-pagination:turn-page', { detail: page }));
  }

  // do not exceed the maximum amount of 9 elements
  get hasSubsets(): boolean {
    return this.count > 7;
  }

  get hasLeftSubset(): boolean {
    return this.current > 4;
  }

  get hasRightSubset(): boolean {
    return (this.hasSubsets && !this.hasLeftSubset) || this.current < this.count - 4;
  }

  get hasBothSubsets(): boolean {
    return this.hasLeftSubset && this.hasRightSubset;
  }

  get hasLeftPage(): boolean {
    return this.current > 1;
  }

  get hasRightPage(): boolean {
    return this.current < this.count;
  }

  handlePageClick(ev: Event) {
    const button = ev.target as HTMLButtonElement;
    // this.current = Number(button.dataset.page);
    if (!button.disabled) {
      this.emitTurnPageEvent(Number(button.dataset.page));
    }
  }

  renderPageButton(
    page: number,
    disabled = false,
    checkActive = false,
    arrow?: string,
  ): TemplateResult {
    return html`
      <time-shift-pagination-button
        arrow="${ifDefined(arrow)}"
        data-page=${page}
        ?active=${checkActive && page === this.current}
        ?disabled=${disabled}
        @click=${this.handlePageClick}
      >
        ${page}
      </time-shift-pagination-button>
    `;
  }

  render() {
    return html`
      ${this.renderPageButton(this.current - 1, !this.hasLeftPage, false, 'left')}
      ${when(
        this.hasSubsets,
        () => html`
          ${this.renderPageButton(1, false, true)}
          ${when(
            this.hasLeftSubset,
            () => html`<time-shift-pagination-dots />`,
            () =>
              html`${Array.from({ length: 4 }, (_, index) =>
                this.renderPageButton(index + 2, false, true),
              )}`,
          )}
          ${when(
            this.hasBothSubsets,

            () => html`
              ${this.renderPageButton(this.current - 1, false, true)}
              ${this.renderPageButton(this.current, false, true)}
              ${this.renderPageButton(this.current + 1, false, true)}
            `,
          )}
          ${when(
            this.hasRightSubset,
            () => html`<time-shift-pagination-dots />`,
            () =>
              html`${Array.from({ length: 4 }, (_, index) =>
                this.renderPageButton(this.count - 1 - index, false, true),
              ).reverse()}`,
          )}
          ${this.renderPageButton(this.count, false, true)}
        `,

        () => html`
          ${Array.from({ length: this.count }, (_, index) =>
            this.renderPageButton(index + 1, false, true),
          )}
          ${this.renderPageButton(this.current + 1, !this.hasRightPage, false, 'right')}
        `,
      )}
    `;
  }
}

declare global {
  interface ElementEventMap {
    'time-shift-pagination:turn-page': CustomEvent<number>;
  }
  interface HTMLElementTagNameMap {
    'time-shift-pagination': Pagination;
  }
}

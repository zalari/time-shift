import { html, LitElement, TemplateResult } from 'lit';
import { eventOptions, property, queryAssignedElements, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';

import { ListConverter } from '../../../utils/converter.utils';
import type { Constructor, Primitive } from '../../../utils/type.utils';

export type InputValidationType = 'initial' | 'blur' | 'change' | 'input';

export declare class EditableInterface<
  T,
  I extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement = HTMLInputElement,
> {
  primitive: Primitive<T>;
  readonly nativeInput: I;

  // public API
  value?: T;
  placeholder?: string;
  name?: string;
  label?: string;
  message?: string;
  disableAutocomplete?: boolean;

  readonly invalid: boolean;
  validateOn: InputValidationType[];
  checkValidity(): boolean;
  triggerValidation(emit?: boolean): void;

  // some internally usable properties
  protected isBeforeSlotEmpty: boolean;
  protected isAfterSlotEmpty: boolean;
  protected readonly beforeSlotElements: HTMLElement[];
  protected readonly afterSlotElements: HTMLElement[];

  protected renderInput(): TemplateResult;
  protected renderBefore(): TemplateResult;
  protected renderAfter(): TemplateResult;
  protected renderContent(): TemplateResult;

  protected handleBeforeSlotChange(): void;
  protected handleAfterSlotChange(): void;

  protected parseValue(value: string): T | undefined;
  protected stringifyValue(value: T | undefined | null): string;

  protected handleBlur(): void;
  protected handleChange(): void;
  protected handleInput(): void;
}

export const Editable =
  <T, I extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>() =>
  <E extends Constructor<LitElement>>(SuperClass: E) => {
    class EditableElement extends SuperClass {
      static readonly formAssociated = true;

      declare primitive: Primitive<T, never>;

      declare nativeInput: I;

      @queryAssignedElements({ slot: 'before' })
      protected readonly beforeSlotElements!: HTMLElement[];

      @queryAssignedElements({ slot: 'after' })
      protected readonly afterSlotElements!: HTMLElement[];

      @state()
      invalid = false;

      @state()
      protected isBeforeSlotEmpty = true;

      @state()
      protected isAfterSlotEmpty = true;

      @property({ reflect: true })
      value?: T;

      @property({ reflect: true, type: String })
      placeholder?: string;

      @property({ reflect: true, type: String })
      name?: string;

      @property({ reflect: true, type: String })
      label?: string;

      @property({ reflect: true, type: String })
      message?: string;

      @property({ reflect: true, type: Boolean, attribute: 'disable-autocomplete' })
      disableAutocomplete = false;

      /**
       * The events that triggers validation.
       * Can be either a single value or a space separated list of values.
       * E.g. `validate-on="initial blur"` or `validate-on="change"`
       */
      @property({ reflect: true, attribute: 'validate-on', converter: ListConverter(' ') })
      validateOn: InputValidationType[] = ['blur'];

      checkValidity(): boolean {
        return this.nativeInput.checkValidity();
      }

      /**
       * Allows triggering the validation manually on the input element.
       * Will emit a custom event to notify e.g. custom validation logic
       * if explicitly requested. This is opt-in to prevent infinite
       * loops if triggered from outside.
       */
      triggerValidation(emit = false) {
        this.invalid = !this.checkValidity();
        // notify about validation (mostly used from inside this component)
        if (emit) {
          this.dispatchEvent(new CustomEvent('validate'));
        }
      }

      // do magic no one understands, but will make us eternal heroes
      protected parseValue(value: string): T | undefined {
        if (value === '') return undefined;
        return this.primitive(value) as T;
      }

      // stringifies values, used as formatter default and to
      // derive the native input value (thus it can be `null`)
      protected stringifyValue(value: T | undefined | null): string {
        return value === undefined || value === null ? '' : String(value);
      }

      protected firstUpdated() {
        if (this.validateOn.includes('initial')) {
          this.triggerValidation(true);
        }
      }

      @eventOptions({ passive: true })
      protected handleBlur() {
        // check for validity if configured
        if (this.validateOn.includes('blur')) {
          this.triggerValidation(true);
        }
      }

      @eventOptions({ passive: true })
      protected handleChange() {
        this.value = this.parseValue(this.nativeInput.value);

        // check for validity if configured
        if (this.validateOn.includes('change')) {
          this.triggerValidation(true);
        }
      }

      @eventOptions({ passive: true })
      protected handleInput() {
        this.value = this.parseValue(this.nativeInput.value);

        // check for validity if configured
        if (this.validateOn.includes('input')) {
          this.triggerValidation(true);
        }
      }

      @eventOptions({ passive: true })
      protected handleBeforeSlotChange() {
        this.isBeforeSlotEmpty = this.beforeSlotElements.length < 1;
      }

      @eventOptions({ passive: true })
      protected handleAfterSlotChange() {
        this.isAfterSlotEmpty = this.afterSlotElements.length < 1;
      }

      protected declare renderInput: () => TemplateResult;

      protected renderBefore() {
        return html`
          <span class="${classMap({ before: true, empty: this.isBeforeSlotEmpty })}">
            <slot name="before" @slotchange="${this.handleBeforeSlotChange}"></slot>
          </span>
        `;
      }

      protected renderAfter() {
        return html`
          <span class="${classMap({ after: true, empty: this.isAfterSlotEmpty })}">
            <slot name="after" @slotchange="${this.handleAfterSlotChange}"></slot>
          </span>
        `;
      }

      protected renderContent() {
        return html`
          ${this.renderBefore()} ${this.renderAfter()}
          ${when(this.label !== undefined, () => html`<span class="label">${this.label}</span>`)}

          <div class="below">
            ${when(
              this.message !== undefined,
              () => html`<span class="message">${this.message}</span>`,
            )}
            <slot name="below"></slot>
          </div>
          <span class="border"></span>
        `;
      }

      protected render() {
        return html`
          <label class="${classMap({ invalid: this.invalid })}">
            ${this.renderInput()}${this.renderContent()}
          </label>
        `;
      }
    }

    // https://lit.dev/docs/composition/mixins/#when-a-mixin-adds-new-publicprotected-api
    // Cast return type to your mixin's interface intersected with the superClass type
    return EditableElement as unknown as Constructor<EditableInterface<T, I>> & E;
  };

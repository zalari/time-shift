import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';

type Bar<T extends {}> = {
  [K in keyof T]: { key: K; value: T[K] };
}[keyof T][];

@customElement('time-shift-test-form')
class FormTest extends LitElement {
  @query('form')
  testForm!: HTMLFormElement;

  private _handleSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(this.testForm);

    console.log(this.testForm.checkValidity());

    const data: { [key: string]: FormDataEntryValue } = {};

    formData.forEach((value, key) => (data[key] = value));

    console.log(data);
  }

  render() {
    return html`<form id="test-form" @submit=${this._handleSubmit}>
      <time-shift-fieldset legend="Native Text Inputs">
        <time-shift-input-text-native
          name="text-input"
          placeholder="This is not a real input :D Write something..."
        ></time-shift-input-text-native>
        <time-shift-input-text-native
          name="text-input-2"
          placeholder="Second field, this time required"
          required
        ></time-shift-input-text-native>
      </time-shift-fieldset>
      <time-shift-button type="submit">Submit</time-shift-button>
    </form>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-test-form': FormTest;
  }
}

import { LitElement, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import styles from './explanation.component.scss';

@customElement('time-shift-explanation')
export class Explanation extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  render() {
    return html`
      <h1>How to configure Time Shift</h1>
      <p>
        Time Shift collects time entries from various sources and maps them into configured targets.
      </p>
      <dl>
        <dt>Adapters</dt>
        <dd>
          Are provided at runtime by Time Shift. They can be used to access APIs or to convert data.
          They conveniently deliver and receive time entries in a common format.
        </dd>

        <dt>Connections</dt>
        <dd>
          Are used to connect to the adapters by providing necessary credentials. Multiple
          connections can use the same adapter.
        </dd>

        <dt>Queries</dt>
        <dd>
          Use connections to define inputs and filter fields. Each configuration requires to have a
          source connection to be defined which delivers the available filters.
        </dd>

        <dt>Filters</dt>
        <dd>
          Individual filters can be configured to narrow the set of time entries. Each configuration
          has its own filters based on the selected source connection adapter type.
        </dd>

        <dt>Time entries</dt>
        <dd>
          By selecting a configuration the resulting time entries can be loaded. This data set can
          be filtered and individual entries selected for further interactions.
        </dd>

        <dt>Strategy</dt>
        <dd>
          Time entries can be mapped to targets by using a strategy. The strategy defines how the
          mapping is done and is provided by the target adapter.
        </dd>
      </dl>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'time-shift-explanation': Explanation;
  }
}

/**
 * In order to read and write time entries, we need a common type to map the data to.
 * As all adapters are using the same type, only some generic contents may be mapped.
 */
export type TimeEntry<P = {}> = {
  /**
   * an unique identifier within the source adapter.
   */
  id: string;

  /**
   * The date of the time entry.
   */
  at: Date;

  /**
   * Length of the time entry in minutes.
   */
  minutes: number;

  /**
   * Time entry is currently tracking.
   */
  active?: boolean;

  /**
   * Optinal notes for the time entry.
   */
  note?: string;

  /**
   * As adapters may deliver some more information, we can store it here.
   */
  payload?: P;
};

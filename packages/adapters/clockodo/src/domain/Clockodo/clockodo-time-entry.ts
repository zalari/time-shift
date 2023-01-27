export interface ClockodoTimeEntry {
  id: string;
  isClockRunning: boolean;
  text: string | null;
  timeSince: string;
  timeUntil: string | null;
}

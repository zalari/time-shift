export type Constructor<T> = new (...args: any[]) => T;

export type Primitive<T, R = unknown> = T extends number
  ? NumberConstructor
  : T extends string
  ? StringConstructor
  : T extends boolean
  ? BooleanConstructor
  : T extends Date
  ? DateConstructor
  : R;

export type EventWithTarget<T extends HTMLElement = HTMLElement, E extends Event = Event> = E & {
  target: T;
};

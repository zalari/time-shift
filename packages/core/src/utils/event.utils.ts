const listeners = new Map<
  keyof Eventing.DomainEvents,
  Array<Eventing.DomainEvents[keyof Eventing.DomainEvents]>
>();

// global declaration merging allows defining global
// event types in their respective modules
declare global {
  namespace Events {
    interface EventMap {}
  }
}

/**
 * Add a listener for a specific event
 * @param event
 * @param listener
 */
export const addEventListener = <E extends keyof Eventing.DomainEvents>(
  event: E,
  listener: Eventing.DomainEvents[E],
) => {
  listeners.set(event, [...(listeners.get(event) || []), listener]);
};

/**
 * Remove a listener for a specific event
 * @param event
 * @param listener
 */
export const removeEventListener = <E extends keyof Eventing.DomainEvents>(
  event: E,
  listener?: Eventing.DomainEvents[E],
) => {
  if (listener && listeners.has(event)) {
    const without = listeners.get(event)!.filter(l => l !== listener);
    listeners.set(event, without);
  } else {
    listeners.delete(event);
  }
};

/**
 * Dispatches an event of a given type
 * @param events
 */
export const dispatchEvent = (...events: Array<keyof Eventing.DomainEvents>) => {
  events.forEach(event => listeners.get(event)?.forEach((listener: () => void) => listener()));
};

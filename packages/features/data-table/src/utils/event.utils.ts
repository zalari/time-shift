export const isTouchEvent = (event: Event): event is TouchEvent => {
  return 'touches' in event;
};

export const getCursorPosition = (
  event: Event,
): {
  clientX: number;
  clientY: number;
} => {
  if (!isTouchEvent(event) && !(event instanceof MouseEvent)) return { clientX: 0, clientY: 0 };
  const { clientX, clientY } = isTouchEvent(event) ? event.touches[0] : event;
  return { clientX, clientY };
};

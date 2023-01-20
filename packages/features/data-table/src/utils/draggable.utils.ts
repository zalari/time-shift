export const DRAG_START_EVENTS = ['mousedown', 'touchstart'] as const;
export const DRAG_MOVE_EVENTS = ['mousemove', 'touchmove'] as const;
export const DRAG_END_EVENTS = ['mouseup', 'touchend'] as const;

export const getVerticalCenter = (row: Element): number => {
  const { height, top } = row.getBoundingClientRect();
  return top + height / 2;
};

export const getHorizontalCenter = (column: Element): number => {
  const { left, width } = column.getBoundingClientRect();
  return left + width / 2;
};

export const getClosestElement = <T extends Element>(
  offset: number,
  elements: T[],
  getPosition: (element: T) => number,
): T => {
  // find closest column
  let current: T = elements[0];
  elements.reduce((previous, column) => {
    const center = getPosition(column);
    if (Math.abs(center - offset) < Math.abs(previous - offset)) {
      current = column;
      return center;
    } else {
      return previous;
    }
  }, 0);

  return current;
};

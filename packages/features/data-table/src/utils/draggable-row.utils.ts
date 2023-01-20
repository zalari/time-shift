import { DragCallback, DraggingCallback, DropCallback, DropTarget } from '../types/draggable.types';
import { getCursorPosition } from './event.utils';
import {
  DRAG_END_EVENTS,
  DRAG_MOVE_EVENTS,
  DRAG_START_EVENTS,
  getClosestElement,
  getVerticalCenter,
} from './draggable.utils';

// as we need to pass more arguments to the event listeners, we have
// to store references to them to remove them later correctly;
// this only works as we'll have only one listener at the same time
// registered globally and only on simultaneous drag / touch event
let currentGlobalRowDragListener: EventListener;
let currentGlobalRowDropListener: EventListener;
const currentRowStartListeners = new WeakMap<HTMLElement, EventListener>();

export const makeRowDraggable = (
  ref: HTMLElement,
  onDrag: DragCallback<HTMLElement> = () => null,
  onDrop: DropCallback<HTMLElement> = () => null,
  dragging: DraggingCallback<HTMLElement> = () => null,
) => {
  // prepare and store listeners (relative to DOM reference)
  const listener = prepareRowDragStartListener(onDrag, onDrop, dragging);
  DRAG_START_EVENTS.forEach(name => ref.addEventListener(name, listener, false));
  currentRowStartListeners.set(ref, listener);
};

export const destroyDraggableRow = (ref: HTMLElement) => {
  // remove the stored listener
  const listener = currentRowStartListeners.get(ref)!;
  DRAG_START_EVENTS.forEach(name => ref.removeEventListener(name, listener, false));
  currentRowStartListeners.delete(ref);
};

export const prepareRowDragStartListener =
  (
    onDrag: DragCallback<HTMLElement>,
    onDrop: DropCallback<HTMLElement>,
    dragging: DraggingCallback<HTMLElement>,
  ) =>
  (event: Event) => {
    // get the dragged row reference
    const draggedRow = event.currentTarget as HTMLElement;
    const rows = Array.from(draggedRow.parentElement!.children as HTMLCollectionOf<HTMLElement>);

    // prepare and store the global listeners
    currentGlobalRowDragListener = prepareRowDragListener(draggedRow, rows, dragging);
    currentGlobalRowDropListener = prepareRowDropListener(draggedRow, rows, onDrop);

    // now we need to listen to some global events while dragging
    DRAG_MOVE_EVENTS.forEach(name =>
      document.addEventListener(name, currentGlobalRowDragListener, false),
    );
    DRAG_END_EVENTS.forEach(name =>
      document.addEventListener(name, currentGlobalRowDropListener, false),
    );

    // apply callback
    onDrag(draggedRow);
  };

export const prepareRowDragListener =
  (draggedRow: HTMLElement, rows: HTMLElement[], dragging: DraggingCallback<HTMLElement>) =>
  (event: Event) => {
    // apply callback
    dragging(draggedRow, getRowDropTarget(event, rows));
  };

export const prepareRowDropListener =
  (draggedRow: HTMLElement, rows: HTMLElement[], onDrop: DropCallback<HTMLElement>) =>
  (event: Event) => {
    // remove global listeners to finish the drag
    DRAG_MOVE_EVENTS.forEach(name =>
      document.removeEventListener(name, currentGlobalRowDragListener, false),
    );
    DRAG_END_EVENTS.forEach(name =>
      document.removeEventListener(name, currentGlobalRowDropListener, false),
    );

    // apply callback
    onDrop(draggedRow, getRowDropTarget(event, rows));
  };

export const getRowDropTarget = (event: Event, rows: HTMLElement[]): DropTarget<HTMLElement> => {
  // prepare result
  const target: DropTarget<HTMLElement> = {};

  // retrieve pointer position from event
  const { clientY } = getCursorPosition(event);
  const closestRow = getClosestElement<HTMLElement>(clientY, rows, getVerticalCenter);

  // check if the drop target is before or after center
  const center = getVerticalCenter(closestRow);
  if (clientY < center) {
    // the target is between the previous row (if any) and the closest row
    target.after = closestRow;
    if (closestRow.previousElementSibling !== null) {
      target.before = closestRow.previousElementSibling as HTMLElement;
    }
  } else {
    // the target is between the closest row and the next row (if any)
    target.before = closestRow;
    if (closestRow.nextElementSibling !== null) {
      target.after = closestRow.nextElementSibling as HTMLElement;
    }
  }

  return target;
};

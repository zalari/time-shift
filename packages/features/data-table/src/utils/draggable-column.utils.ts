import { DragCallback, DraggingCallback, DropCallback, DropTarget } from '../types/draggable.types';
import { getCursorPosition } from './event.utils';
import {
  DRAG_END_EVENTS,
  DRAG_MOVE_EVENTS,
  DRAG_START_EVENTS,
  getClosestElement,
  getHorizontalCenter,
} from './draggable.utils';

// as we need to pass more arguments to the event listeners, we have
// to store references to them to remove them later correctly;
// this only works as we'll have only one listener at the same time
// registered globally and only on simultaneous drag / touch event
let currentGlobalColumnDragListener: EventListener;
let currentGlobalColumnDropListener: EventListener;
const currentColumnStartListeners = new WeakMap<HTMLElement, EventListener>();

export const makeColumnDraggable = (
  ref: HTMLElement,
  onDrag: DragCallback<HTMLElement> = () => null,
  onDrop: DropCallback<HTMLElement> = () => null,
  dragging: DraggingCallback<HTMLElement> = () => null,
) => {
  // prepare and store listeners (relative to DOM reference)
  const listener = prepareColumnDragStartListener(onDrag, onDrop, dragging);
  DRAG_START_EVENTS.forEach(name => ref.addEventListener(name, listener, false));
  currentColumnStartListeners.set(ref, listener);
};

export const destroyDraggableColumn = (ref: HTMLElement) => {
  // remove the stored listener
  const listener = currentColumnStartListeners.get(ref)!;
  DRAG_START_EVENTS.forEach(name => ref.removeEventListener(name, listener, false));
  currentColumnStartListeners.delete(ref);
};

export const prepareColumnDragStartListener =
  (
    onDrag: DragCallback<HTMLElement>,
    onDrop: DropCallback<HTMLElement>,
    dragging: DraggingCallback<HTMLElement>,
  ) =>
  (event: Event) => {
    // get the dragged column reference
    const draggedColumn = event.currentTarget as HTMLElement;
    const columns = Array.from(
      draggedColumn.parentElement!.children as HTMLCollectionOf<HTMLElement>,
    );

    // prepare and store the global listeners
    currentGlobalColumnDragListener = prepareColumnDragListener(draggedColumn, columns, dragging);
    currentGlobalColumnDropListener = prepareColumnDropListener(draggedColumn, columns, onDrop);

    // now we need to listen to some global events while dragging
    DRAG_MOVE_EVENTS.forEach(name =>
      document.addEventListener(name, currentGlobalColumnDragListener, false),
    );
    DRAG_END_EVENTS.forEach(name =>
      document.addEventListener(name, currentGlobalColumnDropListener, false),
    );

    // apply callback
    onDrag(draggedColumn);
  };

export const prepareColumnDragListener =
  (draggedColumn: HTMLElement, columns: HTMLElement[], dragging: DraggingCallback<HTMLElement>) =>
  (event: Event) => {
    // apply callback
    dragging(draggedColumn, getColumnDropTarget(event, columns));
  };

export const prepareColumnDropListener =
  (draggedColumn: HTMLElement, columns: HTMLElement[], onDrop: DropCallback<HTMLElement>) =>
  (event: Event) => {
    // remove global listeners to finish the drag
    DRAG_MOVE_EVENTS.forEach(name =>
      document.removeEventListener(name, currentGlobalColumnDragListener, false),
    );
    DRAG_END_EVENTS.forEach(name =>
      document.removeEventListener(name, currentGlobalColumnDropListener, false),
    );

    // apply callback
    onDrop(draggedColumn, getColumnDropTarget(event, columns));
  };

export const getColumnDropTarget = (
  event: Event,
  columns: HTMLElement[],
): DropTarget<HTMLElement> => {
  // prepare result
  const target: DropTarget<HTMLElement> = {};

  // retrieve pointer position from event
  const { clientX } = getCursorPosition(event);
  const closestColumn = getClosestElement<HTMLElement>(clientX, columns, getHorizontalCenter);

  // check if the drop target is before or after center
  const center = getHorizontalCenter(closestColumn);
  if (clientX < center) {
    // the target is between the previous column (if any) and the closest column
    target.after = closestColumn;
    if (closestColumn.previousElementSibling !== null) {
      target.before = closestColumn.previousElementSibling as HTMLElement;
    }
  } else {
    // the target is between the closest column and the next column (if any)
    target.before = closestColumn;
    if (closestColumn.nextElementSibling !== null) {
      target.after = closestColumn.nextElementSibling as HTMLElement;
    }
  }

  return target;
};

export type DropTarget<T> = {
  after?: T;
  before?: T;
}

export type DragCallback<T extends Element> = (ref: T) => void;
export type DropCallback<T extends Element> = (column: T, target: DropTarget<T>) => void;
export type DraggingCallback<T extends Element> = (column: T, target: DropTarget<T>) => void;

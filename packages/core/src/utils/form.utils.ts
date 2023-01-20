import type { EditableInterface } from '../components/ui/input/input.component.mixin';

export const unwrapFormElements = (element: any): Array<EditableInterface<any>> => {
  if ('elements' in element) {
    return Array.from(element.elements).flatMap(element => unwrapFormElements(element));
  }
  if ('element' in element) {
    return unwrapFormElements(element.element);
  }
  return [element] as unknown as Array<EditableInterface<any>>;
};

// fallback for browsers without support for ElementInternals and `form.elements`
export const collectFormElements = (element: Element): Element[] => {
  const isFormAssociated = 'formAssociated' in element.constructor;
  const isSlotElement = element instanceof HTMLSlotElement;
  if (isFormAssociated) return [element];
  const children = isSlotElement ? element.assignedElements() : element.children;
  return Array.from(children).flatMap(child => collectFormElements(child));
};

export const getFormElements = (form: HTMLFormElement): Array<EditableInterface<any>> => {
  const supportElementInternals = typeof ElementInternals !== 'undefined';
  const elements = supportElementInternals ? form.elements : collectFormElements(form);
  return Array.from(elements).flatMap(element => unwrapFormElements(element));
};

export const collectDataFromElements = <T>(
  elements: Array<EditableInterface<T>>,
): Record<string, T> => {
  return elements.reduce((data, { name, value }) => ({ ...data, [name!]: value }), {});
};

export const checkFormValidity = (form: HTMLFormElement): boolean =>
  getFormElements(form).every(element => element.checkValidity());

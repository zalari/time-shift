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

export const getFormElements = (form: HTMLFormElement): Array<EditableInterface<any>> => {
  return Array.from(form.elements).flatMap(element => unwrapFormElements(element));
};

export const collectDataFromElements = <T>(
  elements: Array<EditableInterface<T>>,
): Record<string, T> => {
  return elements.reduce((data, { name, value }) => ({ ...data, [name!]: value }), {});
};

export const checkFormValidity = (form: HTMLFormElement): boolean =>
  getFormElements(form).every(element => element.checkValidity());

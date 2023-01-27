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

export const collectDataForNames = <T, N extends string>(
  elements: Array<EditableInterface<T>>,
  names: N[],
): Record<N, T> => {
  // console.log(elements, names)
  const dataElements = elements.filter(({ name }) => names.includes(name! as N));
  return collectDataFromElements(dataElements);
};

export const getFormElements = (form: HTMLFormElement): Array<EditableInterface<any>> => {
  const supportElementInternals = typeof ElementInternals !== 'undefined';
  const elements = supportElementInternals ? form.elements : collectFormElements(form);
  // console.log(elements.length, Array.from(elements).length);
  return Array.from(elements).flatMap(element => unwrapFormElements(element));
};

export const collectDataFromElements = <T>(
  elements: Array<EditableInterface<T>>,
): Record<string, T> => {
  return elements.reduce((data, { name, value }) => {
    if (name === undefined) return data;
    if (name in data) {
      if (Array.isArray(data[name])) return { ...data, [name]: [...data[name], value] };
      else return { ...data, [name]: [data[name], value] };
    } else return { ...data, [name]: value };
  }, {} as any);
};

export const checkFormValidity = (form: HTMLFormElement): boolean =>
  getFormElements(form).every(element => element.checkValidity());

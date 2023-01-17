import { ComplexAttributeConverter } from 'lit';

type ConverterFactory<T> = (...params: any) => Required<ComplexAttributeConverter<T>>;

export const ListConverter: ConverterFactory<string[]> = (separator = ',') => ({
  fromAttribute: value => {
    return value?.split(separator).map(v => v.trim()) || [];
  },
  toAttribute: (value): string | null => {
    if (!value.length) {
      return null;
    }
    return value.join(separator);
  },
});

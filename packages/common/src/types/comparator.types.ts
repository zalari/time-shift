export type AvailableComparatorsMap = {
  date: 'eq' | 'neq' | 'gt' | 'lt';
  number: 'matches' | 'eq' | 'neq' | 'gt' | 'lt';
  string: 'matches' | 'eq' | 'neq' | 'in' | 'nin';
  boolean: 'eq';
};

export type ComparisonValueMap = {
  date: Date;
  number: number;
  string: string;
  boolean: boolean;
};

export type ComparableTypes = keyof AvailableComparatorsMap & keyof ComparisonValueMap;

export type Comparators = AvailableComparatorsMap[ComparableTypes];

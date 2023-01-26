export const encodeParamValue = (data: any): string => {
  return encodeURIComponent(Buffer.from(JSON.stringify(data)).toString('base64'));
};

export const decodeParamValue = <R>(value: string): R => {
  return JSON.parse(`${Buffer.from(decodeURIComponent(value), 'base64')}`);
};

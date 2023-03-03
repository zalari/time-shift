export const isDevEnvironment = (): boolean =>
  window.location.hostname === 'localhost' ||
  window.location.hostname === '0.0.0.0' ||
  window.location.hostname === '127.0.0.1';

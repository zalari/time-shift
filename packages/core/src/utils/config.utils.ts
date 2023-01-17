// this type will be used to derive the config schema from
export type Config = {
  urls: {
    corsProxy: string;
  };
  database: {
    name: string;
  };
};

declare global {
  interface Window {
    'time-shift': {
      // in-memory config cache
      config: Promise<Config>;
    };
  }
}

// mostly used internally
export const loadConfig = async (): Promise<Config> => {
  const response = await fetch('/config.json');
  return response.json();
};

// convenience function to retrieve the config
export const getConfig = async () => {
  if (window['time-shift'] === undefined) {
    window['time-shift'] = {} as any;
  }
  if (window['time-shift'].config === undefined) {
    window['time-shift'].config = loadConfig();
  }
  return window['time-shift'].config;
};

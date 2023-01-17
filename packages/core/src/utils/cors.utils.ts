import { getConfig } from './config.utils';

export const getCorsProxy = async (): Promise<string> => {
  const { urls } = await getConfig();
  return urls.corsProxy;
};

export const hasCorsProxy = async (url: string): Promise<boolean> => {
  const corsProxy = await getCorsProxy();
  return url.startsWith(corsProxy);
};

export const addCorsProxy = async (url: string): Promise<string> => {
  const corsProxy = await getCorsProxy();
  const hasProxy = await hasCorsProxy(url);
  return hasProxy ? url : `${corsProxy}${url}`;
};

export const removeCorsProxy = async (url: string): Promise<string> => {
  const corsProxy = await getCorsProxy();
  const hasProxy = await hasCorsProxy(url);
  return hasProxy ? url.replace(corsProxy, '') : url;
};

export const toggleCorsProxy = async (url: string): Promise<string> => {
  const hasProxy = await hasCorsProxy(url);
  return hasProxy ? removeCorsProxy(url) : addCorsProxy(url);
};

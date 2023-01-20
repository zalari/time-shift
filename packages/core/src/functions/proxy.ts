import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';

const getRawHeaders = (headers: HandlerEvent['headers'] | Headers): Record<string, string> => {
  return Object.entries(headers)
    .filter(([, value]) => value !== undefined)
    .reduce((all, [key, value]) => ({ ...all, [key]: `${value}` }), {});
};

const getHeaders = (headers: HandlerEvent['headers'] | Headers): Headers => {
  return new Headers(getRawHeaders(headers));
};

const handler: Handler = async ({ rawUrl, headers, httpMethod, body: rawBody }: HandlerEvent) => {
  // parse the url from the query params
  const { searchParams } = new URL(rawUrl);
  if (!searchParams.has('url')) {
    return { statusCode: 400, body: 'Missing "url" query parameter' };
  }

  // do the actual request
  try {
    // create headers from original request
    const rawHeaders = getHeaders(headers);

    // strip some headers
    rawHeaders.delete('client-ip');
    rawHeaders.delete('cookie');
    rawHeaders.delete('connection');
    rawHeaders.delete('host');
    rawHeaders.delete('referer');
    rawHeaders.delete('sec-ch-ua');
    rawHeaders.delete('sec-ch-ua-platform');
    rawHeaders.delete('sec-ch-ua-mobile');
    rawHeaders.delete('sec-fetch-dest');
    rawHeaders.delete('sec-fetch-mode');
    rawHeaders.delete('sec-fetch-site');
    rawHeaders.delete('sec-fetch-user');
    rawHeaders.delete('x-forwarded-for');

    // add custom user agent
    if (searchParams.has('ua')) {
      rawHeaders.set('user-agent', searchParams.get('ua')!);
    }

    // do the request
    const response = await fetch(searchParams.get('url')!, {
      headers: rawHeaders,
      method: httpMethod,
      body: rawBody,
    });

    // gather result
    const statusCode = response.status;
    const body = await response.text();

    // add missing cors headers
    const proxyHeaders = new Headers(response.headers);
    proxyHeaders.append('access-control-allow-origin', '*');

    // return the aligned response
    return {
      statusCode,
      body,
      headers: getRawHeaders(proxyHeaders),
    } satisfies HandlerResponse;
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Server error' };
  }
};

export { handler };

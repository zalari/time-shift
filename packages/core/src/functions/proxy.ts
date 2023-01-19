import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';

const getRawHeaders = (headers: HandlerEvent['headers'] | Headers): Record<string, string> => {
  return Object.entries(headers)
    .filter(([, value]) => value !== undefined)
    .reduce((all, [key, value]) => ({ ...all, [key]: `${value}` }), {});
};

const handler: Handler = async ({ rawUrl, headers, httpMethod, body: rawBody }: HandlerEvent) => {
  // parse the url from the query params
  const { searchParams } = new URL(rawUrl);
  if (!searchParams.has('url')) {
    return { statusCode: 400, body: 'Missing "url" query parameter' };
  }

  // do the actual request
  try {
    // strip original headers
    const rawHeaders = getRawHeaders(headers);
    delete rawHeaders.connection;
    delete rawHeaders.host;

    // add custom user agent
    if (searchParams.has('ua')) {
      rawHeaders['user-agent'] = searchParams.get('ua')!;
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

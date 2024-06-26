import { getConfig } from './config';
import { request } from 'undici';

export default async function aposResponse(req) {
  const { aposHost } = getConfig(); 
  const url = new URL(req.url);
  const aposUrl = new URL(url.pathname, aposHost);
  aposUrl.search = url.search;

  const requestHeaders = {}
  for (const header of req.headers) {
    requestHeaders[header[0]] = header[1];
  }
  const res = await request(aposUrl.href, { headers: requestHeaders, method: req.method, body: req.body });
  const responseHeaders = new Headers();
  Object.entries(res.headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => responseHeaders.append(key, v));
    }
    else responseHeaders.set(key, value);
  });
  const { headers, statusCode, ...rest } = res;
  const body = [204, 304].includes(statusCode) ? null : res.body;
  const response = new Response(body, { ...rest , status: res.statusCode, headers: responseHeaders });
  return response;
};


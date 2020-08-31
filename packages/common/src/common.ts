console.log('Loaded: @packages/common');

import * as HTTP from 'http';
import * as Url from 'url';

import { echo } from '@example/example-1';

import { deferredPromise } from './deferred-promise';
export { deferredPromise };

export const add = (a: number, b: number) => a + b;

export { echo };

export async function get(url: string): Promise<string> {
  const prom = deferredPromise();
  HTTP.get(url, (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => { prom.resolve(data); });
  }).on('error', (err) => {
    console.log("Error: " + err.message);
    prom.reject(err);
  });
  return prom as Promise<string>;
}

export async function post(url: string, data: any): Promise<any> {
  const urlObj = Url.parse(url, true);
  const dataStr = JSON.stringify(data);
  const options = {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.path,
    query: urlObj.search,
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dataStr.length
    }
  };

  const prom = deferredPromise();
  const req = HTTP.request(options, (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => { prom.resolve(data); });
  }).on('error', (err) => {
    console.log("Error: " + err.message);
    prom.reject(err);
  });
  req.write(dataStr);
  req.end();

  return prom as Promise<string>;
}


console.log("Calling echo from @packages/common");
echo();

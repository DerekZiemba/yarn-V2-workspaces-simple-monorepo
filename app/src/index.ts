
console.log('Loaded: app');

import * as HTTP from 'http';

import * as Example1 from '@example/example-1';
import { get, post } from '@packages/common';
import * as Server from '@packages/server';

Example1.echo();
console.log(`Compare ports: example-1: ${Example1.data.port} === server: ${Server.port}`);

(async () => {
  console.log(await get(`http://localhost:${Server.port}`));

  console.log(await post(`http://localhost:${Server.port}/echo`, { test: 'post' }));

  console.log(await get(`http://localhost:${Server.port}/data`).then(JSON.parse));

  console.log(await get(`http://localhost:${Server.port}/add?a=2&b=5`));

  Server.stop();
})();


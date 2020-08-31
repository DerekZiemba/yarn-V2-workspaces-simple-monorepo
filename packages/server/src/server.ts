console.log('Loaded: @packages/server');

import * as HTTP from 'http';
import * as Url from 'url';

import { add } from '@packages/common';
import { getData } from '@example/example-2';

let _requestMade = false;

export const server = HTTP.createServer((request: HTTP.IncomingMessage, response) => {
  _requestMade = true;

  console.log(`Server Responding to Request: ${request.method} ${request.url}`);

  request.on('error', (err) => {
    console.error(err);
    response.statusCode = 400;
    response.end();
  });
  response.on('error', (err) => {
    console.error(err);
  });

  let body = Array<any>();
  request.on('data', (chunk) => body.push(chunk));

  request.on('end', () => {
    let url = Url.parse(request.url!, true);
    let query = url.query as any;

    response.statusCode = 200;

    if (request.method === 'POST' && url.pathname === '/echo') {
      let data = Buffer.concat(body).toString();
      console.log("Server Received: ", data);
      request.pipe(response);
    } else if (url.pathname === '/data') {
      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(getData()));

    } else if (url.pathname === '/add') {
      let sum = add(+query.a, + query.b);
      response.end(`${query.a} + ${query.b} = ${sum}`);
    } else {
      response.end("Hello world!");
    }
  });
});

export const port = getData().port;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});


export function stop() {
  server.close(() => {
    console.log("Server Stopped");
  });
}

setTimeout(() => {
  if (!_requestMade) {
    console.warn("Shutting server down due to inactivity.");
    stop();
  }
}, 2000);

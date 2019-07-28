const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Ping');
  res.statusCode = 200;
  res.end('Hello world');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

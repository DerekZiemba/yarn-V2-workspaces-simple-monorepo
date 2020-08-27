
import * as HTTP from 'http';

import { add, echo } from "@test/common";
import * as Other from "other-example";

// import Other = require('other-example');

const svr: HTTP.Server = Other.server;
const data = Other.getData();
console.log("Other Server Should be started on ", Other.port);

console.log("Adding 1 and 2");
console.log(add(1, 2));


svr.close(() => {
  console.log("Server Closed")
});


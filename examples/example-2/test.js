console.log('Loaded: @example/example-2');

const { echo, data } = require('@example/example-1');
const omit = require('lodash.omit');

console.log(omit(data, ['secret']), 'Should not display "secret"');

module.exports.getData = () => {
  console.log("getData called in example 2. Now calling echo from example-1:")
  echo();
  return data;
};

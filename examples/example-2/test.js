
const { echo } = require('example-1');
const omit = require('lodash.omit');

const data = {
  public: 'data',
  secret: 'super-secret'
};

console.log(omit(data, ['secret']), 'Should not display "secret"');


module.exports.getData = () => {
  console.log("getData called in example 2. Now calling echo from example-1:")
  echo();
  return data;
};

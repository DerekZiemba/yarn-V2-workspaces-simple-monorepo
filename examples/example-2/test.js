const omit = require('lodash.omit');

const data = {
  public: 'data',
  secret: 'super-secret'
};

console.log(omit(data, ['secret']), 'Should not display "secret"');

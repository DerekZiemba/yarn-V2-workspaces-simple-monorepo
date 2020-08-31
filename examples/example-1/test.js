console.log('Loaded: @example/example-1');

module.exports.data = {
  public: 'data',
  secret: 'super-secret',
  port: 1337
};

module.exports.echo = () => console.log("Echo has been called in example 1");

const authResolver = require('./authResolver.js');
const todoResolver = require('./todoResolver.js');

const rootResolver = {
	...authResolver,
	...todoResolver,
};

module.exports = rootResolver;

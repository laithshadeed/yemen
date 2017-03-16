const _ = require('underscore-node');
const getPrototypeMethods = require('./es6-get-prototype-methods');
const getPrototypeMethodsOrGetters = (object) => getPrototypeMethods(object, true);
const decorateExtend = (target, source) => {
	const result = _.extend(target, source);
	getPrototypeMethodsOrGetters(source.constructor).forEach((propertyName) => {
		result[propertyName] = source[propertyName];
	});
	return result;
};

module.exports = decorateExtend;

const {describeInstance} = require('./log-util');

const getCheckedProperty = (object, propertyName, type) => {
	// We prefer to display 'method' instead of 'function' as the function property of an object:
	const typeDescriptor = type === 'function' ? 'method' : type;
	let property = object[propertyName];

	if(property === undefined) {
		throw new Error(`No such ${typeDescriptor}: ${describeInstance(object)}.${propertyName}`);
	} else if(type === 'function' && typeof property !== 'function') {
		// TypeError: this.callback is not a function
		throw new Error(`Property is not a function: ${describeInstance(object)}.${propertyName}`);
	} else if(type === 'function') {
		// Don't use .bind; not always available.
		property = (...args) => object[propertyName](...args);
	}

	return property;
};

module.exports = getCheckedProperty;

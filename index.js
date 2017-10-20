const bus = require('./lib/bus');
const {RootAction} = require('./lib/actions');
const spec = require('./lib/spec');
const options = require('./lib/options');

module.exports = {
	bus,
	RootAction,
	spec,
	options,
};

const logia = require('logia')("yemen/spec");

const describeInstance = (x) => `[an instance of ${x.constructor.name}]`;
let level = 0;
const pad = () => "\t".repeat(level);
const specLog = function log(msg, ...args) {
	//eslint-disable-next-line
	logia.trace(`${pad()}${msg}`, ...args);
};

const describe_ = (description, cb) => {
	specLog(`describe(${description})`);
	level++;
	describe(description, cb);
	level--;
};
const before_ = (cb) => {
	specLog(`before(...)`);
	level++;
	before(cb);
	level--;
};
const it_ = (description, cb) => {
	specLog(`it(${description})`);
	level++;
	it(description, cb);
	level--;
};

module.exports = {
	specLog,
	describeInstance,
	describe_,
	before_,
	it_,
};

const describeInstance = (x) => `[an instance of ${x.constructor.name}]`;
let level = 0;
const pad = () => "\t".repeat(level);
const log = function log(msg, ...args) {
	if(log.debug) {
		//eslint-disable-next-line
		console.log(`${pad()}${msg}`, ...args);
	}
};

// const describe = (description, cb) => {
// 	log(`describe(${description})`);
// 	level++;
// 	cb();
// 	level--;
// };
// const before = (cb) => {
// 	log(`before(...)`);
// 	level++;
// 	cb();
// 	level--;
// };
// const it = (description, cb) => {
// 	log(`it(${description})`);
// 	level++;
// 	cb();
// 	level--;
// };

module.exports = {
	log,
	describeInstance,
	// describe,
	// before,
	// it,
};

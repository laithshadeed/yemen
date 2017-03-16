const describeInstance = (x) => `[an instance of ${x.constructor.name}]`;
let level = 0;
const pad = () => "\t".repeat(level);
const log = (msg) => console.log(`${pad()}${msg}`);

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

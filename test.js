
const {log, describeInstance} = require('./lib/log-util');

class Widget {
	constructor() {//webElement) {
		// this.webElement = webElement;
		// this.type = getWidgetType(webElement);
		// this.description = getWidgetName(webElement);
	}
	setContents() {//...identifierNames) {
		// console.log("setContents", identifierNames);
		return this;
	}
}

class Cell {
	constructor() {//webElement) {
		// this.webElement = webElement;
	}
	getValue() {
		let result = "3.14";

		// const inputElement = this.webElement.element('input');
		// if(inputElement.isExisting()) {
		// 	result = inputElement.getValue();
		// } else {
		// 	result = this.webElement.getText();
		// }

		return result;
	}
}

class Table extends Widget {
	getCell(row, col) {
		log(`invoked ${describeInstance(this)}.getCell(${JSON.stringify(row)}, ${JSON.stringify(col)})`);
		// const cellWebElement = this.webElement.element(`.grid-viewport .row${row}.col${col}`);
		// waitFor(cellWebElement);
		return new Cell();//cellWebElement);
	}
}

// const globalize = require('./lib/globalize');
const globalize = (object) => {
        Object.keys(object).forEach((key) => {
                global[key] = object[key];
        });
};
globalize(require('./lib/log-util'));
global.timeout = () => {};

const bus = require('./lib/bus');
const {RootAction} = require('./lib/actions');
const spec = require('./lib/spec');
const {scenario} = spec;
bus.subscribe(spec);

bus.subscribe({
	onRegisterActions(actionRegistry) {
		actionRegistry.push(
			new RootAction("loadPage", (pageUri) => {
				log(`loading page ${pageUri}`);
			}),
			new RootAction("findWidget", (name) => {
				log(`find widget with name: ${name}`);
				return new Table();
			})
		);
	},
});

bus.trigger('initialized');

scenario("Table shows data", () => {

	loadPage("table/render");

	const w = findWidget('RenderTable');
	w
		.getCell(0, 2)
		.getValue()
			.should.be.equal('3.14')
	;
	w
		.getCell(0, 3)
		.getValue()
			.should.be.equal('5.00')
	;

	findWidget('RenderTable');
});

const {expect} = require('chai');

const createMissingMethodOrPropertyProxy = require('./proxy-method-or-property-missing');
const getCheckedProperty = require('./get-checked-property');
const decorateExtend = require('./decorate-extend');

const {log, describeInstance} = require('./log-util');
// const {describe, before, it} = require('./log-util');

class Action {
	constructor(parentAction, description, callback) {
		if(this.generateSpec === undefined) {
			throw new Error("Action is an abstract class and cannot be instantiated directly, please implement: generateSpec()");
		}

		this.parentAction = parentAction;
		this.description = description;
		this.callback = callback;
		this.childActions = [];
	}
	get ancestors() {
		const ancestors = [];

		let current = this;
		while(current) {
			ancestors.push(current);
			current = current.parentAction;
		}

		return ancestors;
	}
	do(resultOfPreviousAction) {
		return this.callback(resultOfPreviousAction);
	}
}
// Note: deliberate 'function'
Action.newInstance = function(...args) {
	return new this(...args);
};

class DescribeAction extends Action {
	generateSpec(getResultOfPreviousAction=() => {}) {
		describe(`when doing ${this.description}`, () => {
			let resultOfCurrentAction
			before(() => {
				resultOfCurrentAction = this.do(getResultOfPreviousAction());
			});

			this.childActions.forEach((childAction) => childAction.generateSpec(() => resultOfCurrentAction));
		});
	}
}

class RootAction extends DescribeAction {
	constructor(...args) {
		super(null, ...args)
	}
}

class ItAction extends Action {
	generateSpec(getResultOfPreviousAction=() => {}) {
		// console.log("CHUILDACTIONS", this.childActions);
		const descriptionChunks = [];
		let currentAction = this;
		while(currentAction) {
			// console.log("ACT", currentAction.description);
			descriptionChunks.push(currentAction.description);
			if(typeof currentAction === "function" && currentAction.getArgs()) {
				descriptionChunks.push(`${currentAction.getArgs().map((e) => JSON.stringify(e)).join(",")}`);
				// console.log("ARGGGI", currentAction.getArgs());
			}
			currentAction = currentAction.childActions[0];
		}

		it(descriptionChunks.join(" "), () => {
			const resultOfCurrentAction = this.do(getResultOfPreviousAction());
			this.childActions.forEach((childAction) => childAction.generateSpec(() => resultOfCurrentAction));
		});
	}
}

class ChaiComponentAction extends Action {
	generateSpec(getResultOfPreviousAction=() => {}) {
		const resultOfCurrentAction = this.do(getResultOfPreviousAction());
		this.childActions.forEach((childAction) => childAction.generateSpec(() => resultOfCurrentAction));
	}
}
ChaiComponentAction.newInstance = function(...args) {
	const chaiComponentAction = new this(...args);

	let invocationArgs = null;
	const f = function(...args2) {
		invocationArgs = args2;
	};
	const invocableChaiComponentAction = decorateExtend(f, chaiComponentAction);
	invocableChaiComponentAction.getArgs = () => invocationArgs;

	return invocableChaiComponentAction;
};

// Creates a missing method proxy action.
const createMissingMethodProxyAction = (parentAction, methodName, ...args) => {
	if(typeof methodName !== "string" || methodName === 'should' || methodName === 'inspect') {
		return null;
	}
	log(`creating proxy method: ${methodName}`);

	const childAction = DescribeAction.create(parentAction, methodName, (context) => {
		log(`invoking ${describeInstance(context)}.${methodName}(${
			args
				.map((arg) => JSON.stringify(arg))
				.join(",")
		})`);

		return getCheckedProperty(context, methodName, 'function')(...args);
	});

	parentAction.childActions.push(childAction);

	return childAction;
};
// Creates a missing property proxy action (if possible).
// If creating such a property proxy action cannot be created, this function
// return undefined (allowing e.g. a method proxy action to be created).
const createMissingPropertyProxyAction = (parentAction, propertyName) => {
	let property; // must be undefined by default

	if(typeof propertyName === "string" && propertyName !== "inspect") {
		const isDescendantOfShould = parentAction.ancestors.some((e) => e.description === "should");

		if(propertyName === "should") {
			log(`creating proxy property: ${propertyName.toString()}`);
			const childAction = ItAction.create(parentAction, propertyName, (context) => expect(context).to);

			parentAction.childActions.push(childAction);
			property = childAction;
		} else if(isDescendantOfShould) {
			log(`creating proxy property: ${propertyName.toString()}`);

			const childAction = ChaiComponentAction.create(parentAction, propertyName, (context) => {
				let result;

				const args = childAction.getArgs();
				if(args) {
					result = getCheckedProperty(context, propertyName, 'function')(...args);
				} else {
					result = getCheckedProperty(context, propertyName, 'property');
				}

				return result;
			});

			parentAction.childActions.push(childAction);
			property = childAction;
		}
	}

	return property;
};

// Note: deliberate 'function'
Action.create = function(...args) {
	const action = this.newInstance(...args);

	const proxiedAction = createMissingMethodOrPropertyProxy(
		action,
		(...args2) => createMissingMethodProxyAction(action, ...args2),
		(...args2) => createMissingPropertyProxyAction(action, ...args2)
	);

	return proxiedAction;
};

module.exports = {
	RootAction,
	ItAction,
};

const bus = require('./bus');
const traversal = require('traversal');

const {ItAction} = require('./actions');

const collect = (action, callback) => {
	const collection = [];

	var ActionTraverser = traversal()
		.visit(function (node, recur) {
			const collectedNode = callback(node, recur)
			if(collectedNode !== undefined) {
				collection.push(collectedNode);
			}
		})
		.preorder('childActions')
	;

	ActionTraverser.walk(action);

	return collection;
};

let firstRootAction = null;
let lastRootAction = null;
const setupGlobalActions = (actions) => {
	actions.forEach((action) => {
		console.log("setting up global", action.description);
		global[action.description] = (...args) => {
			const queuedAction = action.constructor.create(action.description, () => {
				bus.trigger('executingRootAction', action, ...args);
				const result = action.callback(...args);
				bus.trigger('rootActionExecuted', action, ...args);

				return result;
			});

			if(firstRootAction === null && lastRootAction === null) {
				firstRootAction = queuedAction;
			} else {
				const theDescribeActionLeaves =
					collect(lastRootAction, (node, recur) => {
						let theDescribeActionLeafNode; // undefined by default; not collected

						if(node instanceof ItAction) {
							recur.stop();
							theDescribeActionLeafNode = node.parentAction;
						} else if(node.childActions.length === 0) {
							theDescribeActionLeafNode = node;
						}

						return theDescribeActionLeafNode;
					})
				;

				// The code ensures that there must be an end of chain, even if this means
				// it is lastRootAction.
				const endOfActionChain = theDescribeActionLeaves.slice(-1)[0];
				endOfActionChain.childActions.push(queuedAction);
			}

			lastRootAction = queuedAction;

			return queuedAction;
		};
	});
};

module.exports = {
	onInitialized() {
		const actionRegistry = [];
		bus.trigger("registerActions", actionRegistry);

		// console.log("actionRegistry", actionRegistry);
		setupGlobalActions(actionRegistry);
	},
	scenario: (description, cb) => {
		bus.trigger('executingScenario', description, cb);

		describe(description, () => {

			firstRootAction = lastRootAction = null;

			console.log(`queuing actions`);

			cb();

			console.log(`generating spec...`);

			if(firstRootAction !== null) {
				firstRootAction.generateSpec();
			}
		});

		bus.trigger('scenarioExecuted', description, cb);
	},
};

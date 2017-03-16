const bus = require('./bus');

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
				lastRootAction.childActions.push(queuedAction);
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

		// Note: deliberate function() {}
		describe(description, function() {
			this.timeout(20000); // @TODO probably wdio.conf.js

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

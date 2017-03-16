// Usage:
// 
//    bus.on("foo", (...args) => {
//       console.log("foo was triggered", args);
//    });
//    bus.subscribe({
//       onFoo(...args) {console.log("foo triggered too", args)}
//    });
//    bus.trigger("foo", 1,2,3);
//    => foo triggered [ 1, 2, 3 ]
//    => foo triggered too [ 1, 2, 3 ]
//

const Minibus = require('minibus');

// Deliberate 'function'
Minibus.extension.subscribe = function(objectWithHandlers) {
	const bus = this;
	const uncapitalize = (x) => x.charAt(0).toLowerCase() + x.slice(1);
	Object.keys(objectWithHandlers)
		.filter((methodName) => methodName.startsWith("on"))
		.forEach((methodName) => {
			const eventName = uncapitalize(methodName.replace(/^on/, ""));
			const handler = objectWithHandlers[methodName];
			bus.on(eventName, handler);
		})
	;
};

const bus = Minibus.create();

module.exports = bus;

module.exports = {
	shouldMeansShouldEventually: false,
	// Example delay function:
	// window.setTimeout(callback, 1000);
	delay(callback) {
		throw new Error("No delay function specified!");
	}
};

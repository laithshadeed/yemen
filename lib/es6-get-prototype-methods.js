// Source: https://gist.github.com/vladimir-ivanov/eaa4549481e8f7118795

function getClassMethods(className, includeProperties=false) {
	if (!className instanceof Object) {
		throw new Error("Not a class");
	}
	const ret = new Set();
	
	function methods(obj) {
		if (obj) {
			const ps = Object.getOwnPropertyNames(obj);
			
			ps.forEach(p => {
				if (obj[p] instanceof Function) {
					ret.add(p);
				} else if(includeProperties){
					ret.add(p);
				}
			});
			
			methods(Object.getPrototypeOf(obj), includeProperties);
		}
	}
	
	methods(className.prototype);
	
	return Array.from(ret);
}

module.exports = getClassMethods;

// Based on npm module proxy-method-missing

module.exports = function (object, missingMethod, getMissingProperty) {
  const proxyObject = new Proxy(object, {
    get(object, property) {
      if (Reflect.has(object, property)) {
        return Reflect.get(object, property);
      } else {
        let missingProperty = getMissingProperty(property);

        if(missingProperty === undefined) {
            missingProperty = (...args) => Reflect.apply(missingMethod, proxyObject, [property, ...args]);
        }

        return missingProperty;
      }
  },
  });
  return proxyObject;
}

const middleware = {};

const removeNulls = (object, removeEmptyStrings = false) => {
  const newObject = {};
  Object.keys(object).forEach((key) => {
    if ((object[key] !== null && object[key] !== undefined) && (!removeEmptyStrings || object[key] !== '')) {
      newObject[key] = object[key];
    }
  });
  return newObject;
};

middleware.removeNulls = removeNulls;

module.exports = middleware;

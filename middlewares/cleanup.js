const middleware = {};

const removeNulls = (object) => {
  const newObject = {};
  Object.keys(object).forEach((key) => {
    if (object[key] !== null && object[key] !== undefined) {
      newObject[key] = object[key];
    }
  });
  return newObject;
};

middleware.removeNulls = removeNulls;

module.exports = middleware;

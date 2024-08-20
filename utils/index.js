const { either, isNil, isEmpty } = require("ramda");

const isEmptyOrNil = either(isNil, isEmpty);

module.exports = {
    isEmptyOrNil,
};

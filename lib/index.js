'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.postgrestAuthenticator = exports.postgrestClient = undefined;

var _postgrestClient = require('./postgrestClient');

var _postgrestClient2 = _interopRequireDefault(_postgrestClient);

var _postgrestAuthenticator = require('./postgrestAuthenticator');

var postgrestAuthenticator = _interopRequireWildcard(_postgrestAuthenticator);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.postgrestClient = _postgrestClient2.default;
exports.postgrestAuthenticator = postgrestAuthenticator;
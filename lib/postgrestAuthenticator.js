'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createAuthRefreshSaga = exports.createAuthProvider = undefined;

var _reactAdmin = require('react-admin');

var _effects = require('redux-saga/effects');

var _reduxSaga = require('redux-saga');

var _jwtDecode = require('jwt-decode');

var _jwtDecode2 = _interopRequireDefault(_jwtDecode);

var _actions = require('ra-core/esm/actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var moduleLoginUrl = void 0;
var moduleRefreshUrl = void 0;

var createAuthProvider = function createAuthProvider(loginUrl) {

	moduleLoginUrl = loginUrl;

	return function (type, params) {

		if (type === _reactAdmin.AUTH_LOGIN) {
			var username = params.username,
			    password = params.password;

			var request = new Request(moduleLoginUrl, {
				method: 'POST',
				body: JSON.stringify({ email: username, password: password }),
				headers: new Headers({
					'Content-Type': 'application/json',
					'Accept': 'application/vnd.pgrst.object+json'
				})
			});
			return fetch(request).then(function (response) {
				if (response.status < 200 || response.status >= 300) {
					throw new Error(response.statusText);
				}
				return response.json();
			}).then(function (_ref) {
				var token = _ref.token;

				localStorage.setItem('token', token);
			});
		}

		if (type === _reactAdmin.AUTH_LOGOUT) {
			localStorage.removeItem('token');
			return Promise.resolve();
		}

		if (type === _reactAdmin.AUTH_ERROR) {
			var status = params.status;
			if (status === 401 || status === 403) {
				localStorage.removeItem('token');
				return Promise.reject();
			}
			return Promise.resolve();
		}

		return Promise.resolve();
	};
};

var refreshToken = function refreshToken(token) {

	var request = new Request(moduleRefreshUrl, {
		method: "GET",
		headers: new Headers({
			'Authorization': 'Bearer ' + token
		})
	});

	return fetch(request).then(function (response) {
		if (response.status < 200 || response.status >= 300) {
			throw new Error(response.statusText);
		}
		return response.json();
	}).then(function (token) {
		// comes back as JSON-encoded plain string
		localStorage.setItem('token', token);
		return token;
	});
};

var refreshTokenFunction = /*#__PURE__*/regeneratorRuntime.mark(function refreshTokenFunction(delayInMs, previousToken) {
	var tokenToRefresh, newToken;
	return regeneratorRuntime.wrap(function refreshTokenFunction$(_context) {
		while (1) {
			switch (_context.prev = _context.next) {
				case 0:
					tokenToRefresh = previousToken;

				case 1:
					if (!true) {
						_context.next = 12;
						break;
					}

					_context.next = 4;
					return (0, _reduxSaga.delay)(delayInMs);

				case 4:
					_context.next = 6;
					return Promise.resolve(refreshToken(tokenToRefresh));

				case 6:
					newToken = _context.sent;
					_context.next = 9;
					return localStorage.setItem('token', newToken);

				case 9:
					tokenToRefresh = newToken;
					_context.next = 1;
					break;

				case 12:
				case 'end':
					return _context.stop();
			}
		}
	}, refreshTokenFunction, this);
});

/*
 * TODO work out how to kick off a refresh timer after a
 * hard reload when user is already logged in
 */
var handleLoginSuccess = /*#__PURE__*/regeneratorRuntime.mark(function handleLoginSuccess(action) {
	var token, decodedToken, expirySeconds, refreshDelayInMs;
	return regeneratorRuntime.wrap(function handleLoginSuccess$(_context2) {
		while (1) {
			switch (_context2.prev = _context2.next) {
				case 0:
					_context2.next = 2;
					return localStorage.getItem('token');

				case 2:
					token = _context2.sent;
					decodedToken = (0, _jwtDecode2.default)(token);
					expirySeconds = Math.round((decodedToken.exp * 1000 - Date.now()) / 1000);
					refreshDelayInMs = (expirySeconds - 5) * 1000;
					_context2.next = 8;
					return (0, _effects.fork)(refreshTokenFunction, refreshDelayInMs, token);

				case 8:
				case 'end':
					return _context2.stop();
			}
		}
	}, handleLoginSuccess, this);
});

var createAuthRefreshSaga = function createAuthRefreshSaga(refreshUrl) {

	moduleRefreshUrl = refreshUrl;

	return (/*#__PURE__*/regeneratorRuntime.mark(function _callee() {
			return regeneratorRuntime.wrap(function _callee$(_context3) {
				while (1) {
					switch (_context3.prev = _context3.next) {
						case 0:
							_context3.next = 2;
							return (0, _effects.takeEvery)(_actions.USER_LOGIN_SUCCESS, handleLoginSuccess);

						case 2:
						case 'end':
							return _context3.stop();
					}
				}
			}, _callee, this);
		})
	);
};

exports.createAuthProvider = createAuthProvider;
exports.createAuthRefreshSaga = createAuthRefreshSaga;
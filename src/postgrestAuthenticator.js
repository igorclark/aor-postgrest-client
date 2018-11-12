import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR } from 'react-admin';
import { fork, takeEvery } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import jwt_decode from 'jwt-decode';

import { USER_LOGIN_SUCCESS, USER_CHECK } from 'ra-core/esm/actions';

let moduleLoginUrl;
let moduleRefreshUrl;

const createAuthProvider = ( loginUrl ) => {

	moduleLoginUrl = loginUrl;

	return ( type, params ) => {

		if ( type === AUTH_LOGIN ) {
			const { username, password } = params;
			const request = new Request( moduleLoginUrl, {
				method: 'POST',
				body: JSON.stringify( { email: username, password } ),
				headers: new Headers( {
					'Content-Type': 'application/json',
					'Accept': 'application/vnd.pgrst.object+json'
				} ),
			} )
			return fetch( request )
				.then( response => {
					if ( response.status < 200 || response.status >= 300 ) {
						throw new Error( response.statusText );
					}
					return response.json();
				} )
				.then( ({ token } ) => {
					localStorage.setItem( 'token', token );
				} );
		}

		if ( type === AUTH_LOGOUT ) {
			localStorage.removeItem( 'token' );
			return Promise.resolve();
		}

		if ( type === AUTH_ERROR ) {
			const status  = params.status;
			if ( status === 401 || status === 403 ) {
				localStorage.removeItem( 'token' );
				return Promise.reject();
			}
			return Promise.resolve();
		}

		return Promise.resolve();
	}
};

const refreshToken = function ( token ) {

	const request = new Request( moduleRefreshUrl, {
		method: "GET",
		headers: new Headers( {
			'Authorization': `Bearer ${token}`
		} )
	} );

	return fetch( request )
		.then( response => {
			if ( response.status < 200 || response.status >= 300 ) {
				throw new Error( response.statusText );
			}
			return response.json();
		} )
		.then( ( token ) => { // comes back as JSON-encoded plain string
			localStorage.setItem( 'token', token );
			return token;
		} );
	
};

const refreshTokenFunction = function* ( delayInMs, previousToken ) {
	let tokenToRefresh = previousToken;

	while( true ) {
		yield delay( delayInMs );
		const newToken = yield Promise.resolve( refreshToken( tokenToRefresh ) );
		yield localStorage.setItem( 'token', newToken );
		tokenToRefresh = newToken;
	}
};

/*
 * TODO work out how to kick off a refresh timer after a
 * hard reload when user is already logged in
 */
const handleLoginSuccess = function* ( action ) {
	const token = yield localStorage.getItem( 'token' );
	const decodedToken = jwt_decode( token );
	const expirySeconds = Math.round( ( decodedToken.exp * 1000 - Date.now() ) / 1000 );
	const refreshDelayInMs = ( expirySeconds - 5 ) * 1000;
	yield fork( refreshTokenFunction, refreshDelayInMs, token );
};

const createAuthRefreshSaga = ( refreshUrl ) => {

	moduleRefreshUrl = refreshUrl;

	return function* () {
		yield takeEvery(
			USER_LOGIN_SUCCESS,
			handleLoginSuccess
		);
	};
};

export {
	createAuthProvider,
	createAuthRefreshSaga
};

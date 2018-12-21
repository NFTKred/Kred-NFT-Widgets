import { checkToken } from './model/login';

const tokenCheck = checkToken();

tokenCheck.then(setToken);

function setToken(t) {
	window.token = t || false;

	if (t) {
		$(document.body).trigger('loginCheck:loggedin', t);
	} else {
		$(document.body).trigger('loginCheck:notloggedin');
	}

}

function checkLogin(callback) {
	tokenCheck.then(callback, () => callback(false));
}

function checkLoginRefresh(callback) {
	checkToken().then(setToken).then(callback, () => callback(false));
}

// expose for other scripts to access (CryptoKred or Engagement Profile, for example)
window.checkLogin = checkLogin;

export { checkLogin, checkLoginRefresh };
export { generateUUID } from './model/login';

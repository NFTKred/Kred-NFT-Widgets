export const client_id = '5334ed7eb7725d5b8c9f03ed';

export function authenticate(code) {
	return ajax({
		type: 'GET',
		dataType: 'json',
		xhrFields: {
			withCredentials: true,
		},
		url: 'https://login.peoplebrowsr.com/authenticate/dotceo',
		data: {
			client_id,
			code,
		},
	}).then(res => res.code)
}

export function getToken(code) {
	return ajax({
		type: 'GET',
		dataType: 'json',
		xhrFields: {
			withCredentials: true,
		},
		url: 'https://login.peoplebrowsr.com/token/dotceo',
		data: {
			client_id,
			code,
		},
	}).then(res => res.access_token);
}

export function connectTwitterAccount() {
	var connect;

	connect = window.open(
		'https://claim.peoplebrowsr.com/link/dotceo/twitter?client_id=5334ed7eb7725d5b8c9f03ed&auth=' +
			encodeURIComponent(window.token) +
			'&redirect_uri=https://login.peoplebrowsr.com/close',
		'_blank',
		'height=600,width=600,status=yes,toolbar=no,menubar=no,location=no'
	);
	connect.focus();
}

export function connectFacebookAccount() {
	var connect;

	connect = window.open(
		'https://claim.peoplebrowsr.com/link/dotceo/facebook?client_id=5334ed7eb7725d5b8c9f03ed&auth=' +
			encodeURIComponent(window.token) +
			'&redirect_uri=https://login.peoplebrowsr.com/close',
		'_blank',
		'height=600,width=600,status=yes,toolbar=no,menubar=no,location=no'
	);
	connect.focus();
}

export function checkToken() {
	return getLoginCode();
}

function getLoginCode() {
	// If there's an __auth param - log them in!
	const authCode = getParameterByName('__auth') || getParameterByName('code');

	if (authCode) {
		return authenticate(authCode).then(code => getToken(code));
	} else {
		return getLoginCodeFromServer();
	}
}

function getLoginCodeFromServer() {
	return checkLoginServer();
}

function checkLoginServer() {
	var data = {
		client_id: client_id,
		response_type: 'token',
		onlogout: encodeURI(
			'http://' +
			location.hostname +
			'/account/logout?preauth=' +
			generateUUID()
		)
	};

	if (window.retryCheck === 1) {
		data.retry = 1;
	}

	return ajax({
		type: 'GET',
		dataType: 'json',
		xhrFields: {
			withCredentials: true
		},
		url: 'https://login.peoplebrowsr.com/check/dotceo',
		data: data
	}).then(function(check) {
		window.retryCheck = 0;
		if (!check.access_token) {
			return;
		}

		return check.access_token;
	});
}

function checkHubspot(code) {
	return ajax({
		type: 'GET',
		dataType: 'json',
		xhrFields: {
			withCredentials: true,
		},
		url: 'https://claim.peoplebrowsr.com/hubusercode/dotceo',
		data: {
			client_id: client_id,
			code: code,
		},
	}).then(function(hubuser) {
		if (!hubuser.code) {
			throw new Error();
		}

		return hubuser.code;
	});
}

function ajax(options) {
	return new Promise((resolve, reject) => {
		$.ajax(options).done(resolve).fail(reject);
	})
}

export function generateUUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
		c
	) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
	});

	return uuid;
}

function getParameterByName(name, url) {
	if (!url) url = location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);

	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

import { memoize } from 'async';
import '../js/checkLogin';
import { last, first, initial, find } from 'underscore';
import request from './request';

const memoizedUser = memoize(user);

window.grabApiUrl = 'https://api.grab.live';

if (!!location.hostname.match(/test\.app\.crypto\.kred/)) {
	window.grabApiUrl = 'https://test.grab.live';
	window.testApp = 1;
}

var url = window.grabApiUrl,
	token = window.token || '734d4bf5-e766-46a9-be21-94035c1343d6',
	loggedInUser = false;

// this comes from unavbar
const checkLogin = window.checkLogin;

// check this when the module first loads, after that it'll be cached
function checkLoggedInUser(callback) {
	checkLogin(accessToken => {
		if (!accessToken) {
			return callback(null, false);
		}

		token = accessToken;

		memoizedUser(function (error, user) {
			if (error) {
				callback(error);
			} else {
				console.log('SETTING USER', user)
				loggedInUser = user;
				callback(null, user);
			}
		});
	});
}

// synchronously return cached logged in user
// it should be already cached before first render, and never changes
function getUser() {
	return loggedInUser || {};
}

// for testing purposes
function setUser(user) {
	loggedInUser = user;
}

function getUserID() {
	return loggedInUser && loggedInUser.id || false;
}

function getHome() {
	return loggedInUser && loggedInUser.home || '';
}

function isUserLoggedIn() {
	return !!getUserID();
}

function requireLogin() {
	if (!isUserLoggedIn()) {
		$('.signup-modal').modal({
			show: true,
			backdrop: 'static'
		});

		return true;
	}

	return false;
}

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);

	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getToken() {
	return token;
}

function user(userId, callback) {
	callback = last(arguments);
	userId = first(initial(arguments)) || null;
	request(
		'GET',
		[url, '/user/home'].join(''),
		{
			user: userId ? userId : '',
			token: getToken(),
		},
		function (error, res) {
			if (error || res.error) {
				return callback(error || res.error);
			}
			var user = res.user;

			if (
				!user ||
				user.id === '552766adb7725d22e5b02910'
			) {
				return callback(null, {id: false});
			}

			user.home =
				find(res.profiles.concat(res.domains), function (profile) {
					return profile && profile.match(/.kred$/) && !profile.match(/\.case\.kred$/);
				}) || find(res.profiles.concat(res.domains), function (profile) {
					return profile && profile.match(/\.case\.kred$/);
				})
				res.home ||
				'';
			user.profiles = res.profiles || [];

			return callback(null, user);
		}
	);
}

function userSetup(callback) {
	checkLoggedInUser(function () {
		request(
			'POST',
			[url, '/user/setup'].join(''),
			{
				token: getToken()
			},
			callback
		);
	});
}

function userLinked(userId, callback) {
	callback = last(arguments);
	userId = first(initial(arguments)) || null;
	request(
		'GET',
		[url, '/account/linked'].join(''),
		{
			user: userId ? userId : '',
			token: getToken()
		},
		function (error, res) {
			if (error || res.error) {
				return callback(error || res.error);
			}
			return callback(null, res);
		}
	);
}

function userDirectionalLinked(type, callback) {
	callback = last(arguments);
	$.ajax({
		url: '/profile/api?domain=controlpanel.ceo&api=/api/user/directed_identities',
		type: 'GET',
		data: {
			'connect_sid': true,
			'token': getToken()
		},
		dataType: 'text',
		crossDomain: true
	}).done(function (response) {
		var message = JSON.parse(response).message[0],
			payload = JSON.parse(response).payload[0].data,
			handles = payload.filter(function (obj) {
				return (type ? obj.domain === type : (obj.domain === 'twitter.com' || obj.domain === 'empire.kred')) && obj.bio && obj.bio.avatar;
			});

		if (handles && handles.length) {
			return callback(null, handles[0]);
		}

		return callback();
	});
}

function sendSMSEmailCoin(coinId,
	platform,
	address,
	toName,
	message,
	priv,
	callback) {
	//coin the coin id
	// platform : one of 'sms' or 'email' or 'domain'
	// address: either a phone number in +61410439552 format or an email address or a domain
	// token: the senders auth token
	// optionally also:
	// message : a message for the coins's grab
	// private: a flag for not posting the message to the grab
	var data = {
		coin: coinId,
		platform: platform,
		address: address,
		toName: toName,
		message: message,
		private: priv,
		token: getToken(),
		channel: window.branding.tldCaps,
		channelurl: window.branding.name
	};

	if (window.testApp) {
		data.test = 1;
	}

	request(
		'GET',
		'https://claim.peoplebrowsr.com/send_coin/dotceo',
		data,
		function (error, res) {
			if (res && res.error) {
				return callback(res.message);
			}
			return callback();
		}
	);
}

function validUserCheck(callback) {
	//check if an EK user has a validated cell phone number and kred domain
	var data = {
		token: getToken(),
	};

	if (window.testApp) {
		data.test = 1;
	}

	request(
		'GET',
		'https://claim.peoplebrowsr.com/usercheck/dotceo',
		data,
		callback
	);
}

function validateUser(method, address, validate, callback) {
	//accept a user supplied cell phone number and SMS a code to that number
	// /validate/dotceo
	// requires a user_id, a method ("phone" only for now. "email" will be accepted but not validated),
	// and an address (phone number in E.164 format. Make sure you urlencode the "+")
	callback = last(arguments);

	var data = {
		method: method,
		address: encodeURI(address),
		token: getToken(),
	};

	if (validate) {
		data.validate = 'phone';
	}

	if (window.testApp) {
		data.test = 1;
	}

	request(
		'GET',
		'https://claim.peoplebrowsr.com/validate/dotceo',
		data,
		callback
	);
}

function confirmUser(code, callback) {
	// accept a SMSed code and mark that phone number as validated (or not)
	// /confirm/dotceo
	// requires a user_id and the code
	var data = {
		code: code,
		token: getToken(),
	};

	if (window.testApp) {
		data.test = 1;
	}

	request(
		'GET',
		'https://claim.peoplebrowsr.com/confirm/dotceo',
		data,
		function (error, res) {
			if (res && res.error) {
				return callback(res.message);
			}
			return callback();
		}
	);
}

function registerDomain(domain, callback) {
	// register a .kred domain and do the associated socialOS setup for that domain
	// /quick_kred/dotceo
	// needs a user_id and a domain (try the user's EK ticker first)
	var data = {
		domain: domain,
		token: getToken(),
	};

	if (window.testApp) {
		data.test = 1;
	}

	request(
		'GET',
		'https://claim.peoplebrowsr.com/quick_kred/dotceo',
		data,
		callback
	);
}

function kycUpload(imagefile, imagetype, callback) {
	// imagefile : the uploaded file
	// imagetype: one of 'driverslicense', 'passport', 'selfie' or 'address' (see below)
	// token: an access token for the logged in user
	//
	// To process KYC, we need the following:
	// a) a primary identity document (drivers license or passport)
	// b) a selfie
	// c) proof of residential address (from a rates notice, utility bill, bank or credit card statement)

	var form = new FormData();
	form.append('imagefile', imagefile);
	form.append('imagetype', imagetype);
	form.append('token', getToken());
	form.append('channel', window.branding.tldCaps);
	form.append('channelurl', window.branding.name);
	$.ajax({
		url: 'https://claim.peoplebrowsr.com/kyc_upload/dotceo',
		type: 'POST',
		cache: false,
		contentType: false,
		processData: false,
		data: form,
		success: function (response) {
			return callback(null, response);
		},
		error: function (response) {
			return callback(response);
		},
	});
}

function kycUploadEmail(callback) {
	// register a .kred domain and do the associated socialOS setup for that domain
	// /quick_kred/dotceo
	// needs a user_id and a domain (try the user's EK ticker first)
	var data = {
		channel: window.branding.tldCaps || 'Coin.Kred',
		channelurl: window.branding.name || 'app.coin.kred',
		token: getToken(),
	};

	if (window.testApp) {
		data.test = 1;
	}

	request(
		'GET',
		'https://claim.peoplebrowsr.com/kyc_upload_email/dotceo',
		data,
		callback
	);
}

function getEKTickerUser(ticker, callback) {
	// Get a user ID from EK ticker
	// /find_ek/dotceo
	$.ajax({
		type: 'GET',
		url: 'https://claim.peoplebrowsr.com/find_ek/dotceo',
		data: {
			ticker: ticker,
		},
	}).done(function (response) {
		return callback(null, response);
	});
}

function remindUser(coinId, callback) {
	$.ajax({
		type: 'GET',
		url: 'https://claim.peoplebrowsr.com/reminder/dotceo',
		data: {
			coin: coinId,
			token: getToken(),
		},
	}).done(function (response) {
		return callback();
	});
}

export {
	checkLogin,
	getParameterByName,
	getToken,
	memoizedUser as user,
	userSetup,
	userLinked,
	userDirectionalLinked,
	sendSMSEmailCoin,
	validUserCheck,
	validateUser,
	confirmUser,
	registerDomain,
	kycUpload,
	kycUploadEmail,
	checkLoggedInUser,
	getUser,
	setUser,
	getUserID,
	getHome,
	isUserLoggedIn,
	getEKTickerUser,
	remindUser,
	requireLogin,
	};

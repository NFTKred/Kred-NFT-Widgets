import _ from 'underscore';
import {getToken, getUser, getUserID, user} from './auth';
import { getQueryParam } from './helpers';

const grabApiUrl = window.grabApiUrl;

function requests(method, url, data, callback) {
	const request = new Promise((resolve, reject) => {
		$.ajax({
			type: method,
			url: `${grabApiUrl}${url}`,
			data: data,
			dataType: 'json',
			crossDomain: true
		}).done(function (response) {
			var message = response.message[0],
				payload = response.payload[0].data;

			if (!!message && message.isError) {
				return reject(message.text);
			}
			return resolve(payload);
		});
	});

	if (callback) {
		return request.then(p => callback(null, p), e => callback(e));
	}

	return request;
}

function getDomainName() {
	// hack for working on jdr.ceo/collection locally
	const queryDomain = getQueryParam(location.href, 'domain') || CoinKredWidget.options.domain;

	if (queryDomain) {
		return queryDomain;
	}

	const domain = location.hostname;

	if (domain.length && domain.split('.').length < 2) {
		return false;
	}

	return domain;
}

async function getDomainOwner() {
	const domainName = getDomainName();

	// if no domain, use the current logged in user ID (if available)
	if (!domainName) {
		return getUser() || '';
	}

	// otherwise, look up the user ID from the domain
	const domain = await checkDomain(domainName);

	// if there's a valid domain and isn't a global marketplace, return the domain's user
	if (!_.isEmpty(domain) && domain.data && !domain.data.ck_global_marketplace) {
		domain.user.home = domain.data && domain.data.name.replace(/kred$/, 'Kred');
		return domain.user;
	}

	// no domain? return the current logged in user
	return getUser();
}

function checkDomain(domainName, callback) {
	return requests('GET', '/profile/api', {
		domain: 'ep.jdr.ceo',
		api: '/api/profile/domain',
		__data: JSON.stringify({
			domainName: domainName.replace(/www\./, '')
		}),
		'connect_sid': true
		//'token': getToken()
	}, callback);
}

function sendGrid(data, callback) {
	// data: {template, to, subject, data}
	return requests('GET', '/profile/api', {
		domain: 'claim.ceo',
		api: '/api/sendGrid/user',
		'__data': JSON.stringify(data),
		'connect_sid': true,
		'token': getToken()
	}, callback);
}

function sendGridviaEmail(data, callback) {
	// data: {template, to, subject, data}
	return requests('GET', '/profile/api', {
		domain: 'claim.ceo',
		api: '/api/sendGrid/custom',
		'__data': JSON.stringify(data),
		'connect_sid': true,
		'token': getToken()
	}, callback);
}


function userUpdate(bio, data, email, callback) {
	return requests('POST', '/profile/postapi', {
		domain: 'ep.jdr.ceo',
		api: '/api/user/edit',
		'__data': JSON.stringify({
			userEntity: {
				id: getUserID(),
				bio: _.extend(bio, {__ns: 'bio'}),
				data: data,
				email: email,
				__ns: 'user'
			}
		}),
		'connect_sid': true,
		'token': getToken()
	}, function (error, user) {
		if (error) {
			return callback();
		}
		return callback(null, user);
	});
}

function tweetIssue(walletId, callback) {
	return requests('GET', '/profile/api', {
		domain: 'ep.jdr.ceo',
		api: '/api/coin/tweet',
		'__data': JSON.stringify({
			wallet: walletId
		}),
		'connect_sid': true,
		'token': getToken()
	}, callback);
}

function stripePayment(data, callback) {
	return requests('GET', '/profile/api', {
		domain: 'claim.ceo',
		api: '/api/payment/cryptoKred',
		'__data': JSON.stringify(data),
		'connect_sid': true,
		'token': getToken()
	}, callback);
}

function stripeCoupon(coupon, callback) {
	return requests('GET', '/profile/api', {
		domain: 'claim.ceo',
		api: '/api/payment/getCoupon',
		coupon: coupon,
		'connect_sid': true,
		'token': getToken()
	}, callback);
}

function urlToBase64(imgUrl, callback) {
	return requests('GET', '/profile/api', {
		domain: 'claim.ceo',
		api: '/api/coin/urlToBase64',
		'__data': JSON.stringify({
			url: imgUrl
		}),
		'connect_sid': true,
		'token': getToken()
	}, function (error, res) {
		if (error) {
			return callback();
		}
		return callback(null, res.data);
	});
}

export {
	checkDomain,
	getDomainName,
	getDomainOwner,
	sendGrid,
	sendGridviaEmail,
	userUpdate,
	tweetIssue,
	stripePayment,
	stripeCoupon,
	urlToBase64
};

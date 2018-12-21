import _ from 'underscore';
import request from './request';
import {getToken} from './auth';

var url = window.grabApiUrl;


function getMessages(data, callback) {
	request('GET', [url, '/coin/messages/'].join(''), _.extend(data, {
		'new': Math.floor((Math.random() * 999) + 1),
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.messages);
	});
}

function postMessage(data, callback) {
	request('POST', [url, '/coin/post'].join(''), _.extend(data, {
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.messages);
	});
}

function comment(coin, messageId, text, callback) {
	request('POST', [url, '/coin/comment'].join(''), {
		coin: coin,
		message: messageId,
		text: text,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.comments);
	});
}

function getComments(messageId, callback) {
	request('GET', [url, '/widget/comments'].join(''), {
		id: messageId,
		format: 'json',
		'new': Math.floor((Math.random() * 999) + 1),
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}

		// strip out empty and make sure it's unique
		// (is that really necessary? who knows)
		const comments = _.uniq(_.compact(res && res.messages || []), message =>
			message.id
		);

		return callback(null, comments);
	});
}

function onLikeOrUnlikeComment(coin, messageId, liked, callback) {
	///widget', method, messageId
	request('POST', [url, '/coin/', (liked ? 'unlike' : 'like')].join(''), {
		coin: coin,
		message: messageId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function onDeleteComment(coin, messageId, callback) {
	request('GET', [url, '/coin/remove'].join(''), {
		coin: coin,
		message: messageId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function onModerate(coin, data, callback) {
	//for hiding (and showing again) messages either individually or by user.
	//action=hide/show
	request('GET', [url, '/coin/moderate'].join(''), _.extend(data, {
		coin: coin,
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function sendInboxMessage(data, callback) {
	//request('POST', '/profile/replymessage', data, callback);
	$.ajax({
		type: "GET",
		dataType: "json",
		url: '/profile/streamsession'
	}).done(function (datasession) {
		$.post('/profile/sendmessage', _.extend(data, {
			session: datasession.session_id
		})).done(function (response) {
			var JSONresponse = $.parseJSON(response);
			return callback(null, JSONresponse);
		});
	});

}

function tweetMessage(data, callback) {
	request('GET', [url, '/grab/post_to'].join(''), _.extend(data, {
		token: getToken()
	}), callback);
}

export {
	getMessages,
	postMessage,
	comment,
	getComments,

	onLikeOrUnlikeComment,
	onDeleteComment,

	onModerate,

	sendInboxMessage,
	tweetMessage
};

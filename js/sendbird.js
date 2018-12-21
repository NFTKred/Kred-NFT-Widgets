import request from './request';
import { checkLogin } from './auth';

import 'expose-loader?SendBird!sendbird';
import '../js/vendor/sendbird-web-widget/src/js/widget';
import '../css/coinChat.css';

const cache = {};
const APPID = "82653EC4-049A-47E8-ACF3-B78ED2AC89E8";

export function connect() {
	return (
	cache.connect ||
	(cache.connect = new Promise(async
		resolve => {
		const { appid, user_id, nickname } = await
		api('user');

		const root = document.createElement('div');
		root.id = 'sb_widget';
		document.body.appendChild(root);

		sbWidget.startWithConnect(appid || APPID, user_id, nickname, resolve);
	}
))
)
	;
}

export function getGrabChat(grab) {
	return cache[grab] || (cache[grab] = api('config', {grab}));
}

function api(method, params) {
	return new Promise((resolve, reject) =>
		checkLogin(token =>
			request(
				'GET',
				`https://claim.peoplebrowsr.com/sendbird_${method}/dotceo`,
				{
					token,
...
	params
}
,
function (error, result) {
	if (error) {
		reject(error);
	} else {
		resolve(result);
	}
}
)
)
)
;
}

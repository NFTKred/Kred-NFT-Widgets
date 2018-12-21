import $ from 'jquery';

let ajax = getAjax;

function getAjax(method, url, data) {
	return new Promise((resolve, reject) =>
		$.ajax({
			type: method,
			dataType: 'json',
			cache: true,
			url: url,
			data: data,
			success: function(res) {
				return resolve(res);
			},
			error: function(res) {
				if (res.status === 500) {
					reject({
						error: 'Something went wrong. Please try again later.',
					});
				} else {
					resolve(res.responseJSON);
				}
			},
		})
	);
}

function request(method, url, data = {}, callback) {
	const promise = ajax(method, url, data);

	if (callback) {
		promise.then(res => callback(null, res), err => callback(err));
	}

	return promise;
}

// injection for testing
export function mockRequest(handler) {
	if (typeof handler === 'object') {
		const map = handler;
		
		handler = function(method, url) {
			for (let partial in map) {
				if (url.indexOf(partial) !== -1) {
					return map[partial];
				}
			}
		};
	}

	ajax = async function(method, url, data) {
		const result = handler(method, url, data);

		if (typeof result === 'undefined') {
			console.warn('request unmocked', method, url, data);
		}

		return result;
	};
}

export function unmockRequest() {
	ajax = getAjax;
}

export default request;

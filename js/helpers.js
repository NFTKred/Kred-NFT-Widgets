import _ from 'underscore';
import request from './request';
import {getToken} from './auth';

var url = window.grabApiUrl;

function timeDifference(end) {
	var endTime = new Date(end),
		now = new Date(),
		end_utc_timestamp = Date.UTC(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(),
				endTime.getHours(), endTime.getMinutes(), endTime.getSeconds(), endTime.getMilliseconds()) + (navigator.platform === 'iPhone' || navigator.platform === 'iPad' ? now.getTimezoneOffset() * 60000 : 0),
		now_utc_timestamp = now.getTime(),
		diffMs = end_utc_timestamp - now_utc_timestamp,
		diffDays = Math.floor(diffMs / 86400000),
		diffHrs = Math.floor((diffMs % 86400000) / 3600000),
		diffMins = Math.floor(((diffMs % 86400000) % 3600000) / 60000),
		text = '';

	if (diffMs <= 0) {
		return 'Ended';
	}

	if (diffDays) {
		text += diffDays + 'D ';
	}
	if (diffHrs) {
		text += diffHrs + 'H ';
	}
	if (diffMins) {
		text += diffMins + (diffDays || diffHrs ? 'M' : (diffMins === 1 ? ' MIN' : ' MINS'));
	}

	return text;
}

function getExpiryString(timestamp) {
	var day = new Date(timestamp * 1000).getUTCDate(),
		month = new Date(timestamp * 1000).getUTCMonth(),
		monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	return [day, monthArr[month]].join(' ');
}

function getDateString(timestamp) {
	var day = new Date(timestamp * 1000).getUTCDate(),
		month = new Date(timestamp * 1000).getUTCMonth(),
		year = new Date(timestamp * 1000).getUTCFullYear(),
		monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	return [day, monthArr[month], year].join(' ');
}

function expiryCheck(timeString) {
	var endTime = new Date(timeString),
		now = new Date(),
		end_utc_timestamp = Date.UTC(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(),
				endTime.getHours(), endTime.getMinutes(), endTime.getSeconds(), endTime.getMilliseconds()) + (navigator.platform === 'iPhone' || navigator.platform === 'iPad' ? now.getTimezoneOffset() * 60000 : 0),
		now_utc_timestamp = now.getTime();

	return end_utc_timestamp < now_utc_timestamp;
}

function objectifyForm(formArray) { //serialize data function
	var returnArray = {};
	for (var i = 0; i < formArray.length; i++) {
		returnArray[formArray[i]['name']] = formArray[i]['value'];
	}
	return returnArray;
}

function upload(name, content, callback) {
	request('POST', [url, '/file/upload'].join(''), {
			token: getToken(),
			content: content.replace(/^data:[^;]+;base64,/, ''),
			name: [new Date().getTime(), name].join('_')
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
			return callback(null, res);
	});
}

function updateUser(data, callback) {
	request('POST', [url, '/user/profile'].join(''), _.extend(data, {
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

/**
 * When a user has not supplied a bio / name the name field just appears blank.
 * This function tries to grab any sort of information from the userObject so we can display at least something relating to the user.
 * @param userEntity
 */
function formatDisplayName(userEntity) {
	if (!userEntity || !userEntity.bio) {
		return '';
	}

	if (userEntity.email && userEntity.email === 'placeholder@peoplebrowsr.com') {
		return '\n';
	}

	var isDigitOnly = function (s) {
		return new RegExp(/^\d+$/).test(s);
	};

	var capitalise = function (s) {
		if (!s) {
			return '';
		}

		return s.replace(/(?:^|\s)\S/g, function (a) {
			return a.toUpperCase();
		});
	};

	var res = '';

	if (userEntity.bio && !_.isEmpty(userEntity.bio.name)) {
		res = userEntity.bio.name;
	} else if (userEntity.bio && !_.isEmpty(userEntity.bio.displayName)) {
		res = userEntity.bio.displayName;
	} else if (userEntity.bio && !_.isEmpty(userEntity.email)) {
		res = userEntity.email.split('@')[0];
	} else if (userEntity.bio && !_.isEmpty(userEntity.name)) {
		res = userEntity.name;
	}

	//res = res.replace(/[0-9]/g, '');
	//res = res.replace('.', ' ');
	//res = res.replace(/[^a-zA-Z0-9 ]/g, '');
	return capitalise(res);
}

function getFirstName(userEntity) {
	var fullname = formatDisplayName(userEntity);

	return fullname && _.first(fullname.split(' '));
}

function getAvatar(user) {
	// lets use avatars.io for twitter users
	if ((user.bio && user.bio.avatar) || user.avatar) {
		var avatar = (user.bio && user.bio.avatar) || user.avatar;
		var isTwitterAvatar = avatar.match(/https?:\/\/(www\.)?twitter\.com\/(#!\/)?@?([^\/]*)/);
		if (isTwitterAvatar && isTwitterAvatar[3]) {
			return 'https://avatars.io/twitter/' + isTwitterAvatar[3] + '/medium';
		}
		return (user.bio && user.bio.avatar.replace('//30p8ypma69uhv', '//d30p8ypma69uhv').replace('http://', 'https://')) || (user.avatar && user.avatar.replace('http://', 'https://'));
	}

	if (user.bio && user.bio.at_name) {
		return 'https://avatars.io/twitter/' + user.bio.at_name;
	}
	// don't ask. some user accounts have this instead of an at_name
	if (user.bio && user.bio.displayName) {
		return 'https://avatars.io/twitter/' + user.bio.displayName;
	}

	return 'https://d30p8ypma69uhv.cloudfront.net/stream/uploads/53756175b7725d370d9a208f_b91f434779e3f4a5f80d4b2373394d83_defaultAvatar.jpg';
}

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function getQueryParam(query, name) {
	var regex = new RegExp("[\\?&]" + escapeRegExp(name) + "=([^&#]*)"),
		results = regex.exec(query);

	return !results ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getIPInfo(callback) {
	request('GET', 'https://ipinfo.io/json', {}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function checkIfMobile() {
	var check = false;
	(function (a) {
		if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
	})(navigator.userAgent || navigator.vendor || window.opera);
	return check || $(window).width() < 768;
}


export {
	timeDifference,
	getExpiryString,
	getDateString,
	expiryCheck,
	objectifyForm,
	upload,
	updateUser,
	formatDisplayName,
	getFirstName,
	getAvatar,
	getQueryParam,
	getIPInfo,
	round,
	checkIfMobile
};
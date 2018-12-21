import { findWhere } from 'underscore';

$(function () {
	var config = {
			hideTimeout: 1000,
			types: {
				TYPE_ERROR: 'error',
				TYPE_MESSAGE: 'message',
				TYPE_PROGRESS: 'progress'
			}
		},
		templates = {
			container: '<div class="messenger alert-container"></div>',
			error: '<div class="messenger-message alert alert-danger" data-messenger-autohide="10000"><i class="fas fa-times"></i> <div class="alert-text text-center"><i class="fas fa-exclamation-triangle fa-lg"></i> <span class="messenger-text"></span></div></div>',
			warn: '<div class="messenger-message alert alert-warning" data-messenger-autohide="10000"><i class="fa fa-times"></i> <div class="alert-text text-center"><i class="fas fa-exclamation-triangle fa-lg"></i> <span class="messenger-text"></span></div></div>',
			message: '<div class="messenger-message alert alert-success" data-messenger-autohide="10000"><a class="alert-link"><i class="fas fa-times"></i> <div class="alert-text text-center"><i class="fas fa-check fa-lg"></i> <span class="messenger-text"></span></div></a></div>',
			progress: '<div class="messenger-message alert alert-info messenger-progress" data-messenger-autohide="90000"><i class="fas fa-times"></i> <div class="alert-text text-center"><i class="fas fa-spin fa-spinner fa-lg"></i> <span class="messenger-text"></span></div></div>'
		};

	function show(type, text, link) {
		if (!findWhere(config.types, type)) {
			return null;
		}

		var $element = $(document.body).find('.messenger'),
			$message = [];

		if (!$element.length) {
			$element = $(templates.container);
			$element.appendTo($(document.body));
		}

		if (type === config.types.TYPE_PROGRESS) {
			$message = $element.find('.messenger-progress');
			if ($message.length) {
				$message.find('.messenger-text').html(text);
				return onHideDelayed($message);
			}
		}

		if ($element.find('.messenger-text')) {
			$element.empty();
		}

		if ($message.length) {
			$message.find('.messenger-text').html(text);
		} else {
			$message = $(templates[type]);
			$message.prependTo($element);
		}

		$message.find('.messenger-text').html(text);
		if (link) {
			$message.find('.alert-link').attr('href', link);
		}

		return onHideDelayed($message);
	}


	function onShow(event, type, text, link) {
		console.log("Notification text:", text, link);
		return show(type, text, link);
	}


	function onProgress(event, text) {
		return show(config.types.TYPE_PROGRESS, text);
	}


	function onProgressStop() {
		return $(document.body).find('.messenger-message').remove();
	}


	function clearTimer(message) {
		var $message = $(message),
			timer = $message.data('messenger-hideTimer');
		if (timer) {
			window.clearTimeout(timer);
			timer = null;
		}
		$message.data('messenger-hideTimer', timer);
	}


	function hide(message) {
		var $message = $(message).closest('.messenger-message');
		clearTimer($message);
		return $message.remove();
	}

	function hider(message) {
		return function () {
			hide(message);
		};
	}

	function onHideDelayed(event) {
		var $message = $('.messenger-message'),
			hideTimeout = parseInt(parseInt($message.data('messenger-autohide'), 10) || config.hideTimeout, 10);
		clearTimer($message);
		return $message.data('messenger-hideTimeout', window.setTimeout(hider($message), hideTimeout));
	}

	function onClick(event) {
		var $message = $('.messenger-message');
		clearTimer($message);
		return hide($message);
	}

	function onMouseover(event) {
		var $message = $('.messenger-message');
		return clearTimer($message);
	}

	$(document.body)
		.on('messenger:show', null, onShow)
		.on('messenger:progressStop', null, onProgressStop)
		.on('click', '.messenger .messenger-message', onClick)
		.on('mouseover', '.messenger .messenger-message[data-messenger-autohide]', onMouseover)
		.on('mouseout', '.messenger .messenger-message[data-messenger-autohide]', onHideDelayed)
		.on('messenger:hideDelayed', '.messenger .messenger-message[data-messenger-autohide]', onHideDelayed);

});

export function errorNotification(error) {
	$(document.body).trigger('messenger:show', ['error', error]);
}

export function warnNotification(message) {
	$(document.body).trigger('messenger:show', ['warn', message]);
}

export function progressNotification(message) {
	$(document.body).trigger('messenger:show', ['progress', message]);
}

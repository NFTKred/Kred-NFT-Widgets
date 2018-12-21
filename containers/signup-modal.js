import '../css/signup/signup.css';

// add it to the page now, for some pages that try to access $('#signup') right in the HTML, assuming it's already there
get();

export function get() {
    var modal = $('#signup');

    if (modal.length === 0) {
        var html = require('../containers/connect_modal.html');
        return $(html).appendTo('body');
    }

    return modal;
}

export function show() {
    get().modal({
		show: true,
		backdrop: 'static'
	});

}

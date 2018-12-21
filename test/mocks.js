import '@babel/polyfill';
import $ from 'jquery';

global.$ = global.jQuery = $;

$.fn.tooltip = function() {
	return this;
};

global.localStorage = {
	getItem() {},
	setItem() {},
	removeItem() {}
};

global.requestAnimationFrame = window.setTimeout;
global.cancelAnimationFrame = window.clearTimeout;

global.HTMLMediaElement.prototype.play = () => {};

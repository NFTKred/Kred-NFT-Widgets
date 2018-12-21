import React from 'react';
import ReactDOM from 'react-dom';

import _ from 'underscore';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { checkLoggedInUser } from './js/auth';
import { MarketplacePage } from './containers/Marketplace';
import MarketplaceSort from './containers/MarketplaceSort';
import CoinComment from './containers/CoinComment';
import MyCollection from './containers/MyCollection';
import Leaderboard from './containers/Leaderboard';

import './css/index';

window.grabApiUrl = 'https://api.grab.live';
window.cryptoURL = 'https://app.coin.kred';

console.log('ck - index.js start', performance.now());
(function (window, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], function ($) {
			return factory(window, $);
		});
	} else if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = factory(window, require('jquery'));
	} else {
		window.CoinKredWidget = factory(window, window.jQuery || window.Zepto);
	}
}(typeof window !== "undefined" ? window : this, function (window, $) {
	'use strict';

	function CoinKredWidget(options) {
		options = CoinKredWidget.options = _.extend({
			target: 'app_coinkred', //ID to render widget
			widget: 'explore', //Widget to render
			domain: '', //Domain data to render
			sort: '-likes', //Sort -/+likes , -/+created, -/+circulation
			tags: '', //Only get coins with these tags
			showCollectionStats: true, //Show collection stats
			showSearchBar: true, //Show search bar
			showSortToggle: true, //Show sort,
			viewOnly: true // All actions are turned off
		}, options);

		checkLoggedInUser(function (error, user) {
			const appRoot = document.getElementById(options.target);
			const props = _.extend({
				loggedInUser: user
			}, options);

			if (!user) {
				require('./containers/Signup');
			}

			console.log('ck - checkLoggedInUser', performance.now());
			if (error) {
				$(document.body).trigger('messenger:show', ['error', error]);
			} else {
				switch (CoinKredWidget.options.widget) {
					case 'explore':
						ReactDOM.render(<MarketplaceSort {...props}/>, appRoot);
						break;
					case 'collection':
						ReactDOM.render(<MyCollection {...props}/>, appRoot);
						break;
					case 'marketplace':
						ReactDOM.render(<MarketplacePage {...props}/>, appRoot);
						break;
					case 'newsfeed':
						ReactDOM.render(<CoinComment {...props} grab="collection"/>, appRoot);
						break;
					case 'leaderboard':
						ReactDOM.render(<Leaderboard {...props}/>, appRoot);
						break;
					default:
						break;
				}

			}
		});
	}

	return CoinKredWidget;

}));

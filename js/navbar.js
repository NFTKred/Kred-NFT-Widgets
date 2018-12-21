import _ from 'underscore';
import async from 'async';
import {getUser, requireLogin, isUserLoggedIn} from './auth';

import { openCreateACoinModal } from '../containers/CreateACoin'
import { openGiveACoinModal } from '../containers/GiveACoin'

import {getWallets, getBalance, limits} from './grab';
import {getQueryParam, round, getAvatar, formatDisplayName} from './helpers';
import {getCryptoKitties} from './cryptokitties';
import { userSetup } from '../js/auth';
import { history } from './history';
import { openAsyncModal } from './modal';

export function navbar() {
	console.log('Load Navbar');

	if (navigator.platform === 'MacIntel' || navigator.platform === 'MacPPC') {
		$('body').addClass('mac-platform');
	}

	if (navigator.platform === 'iPhone' || navigator.platform === 'iPad') {
		$('body').addClass('iphone-platform');
	}

	if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
		$('body').addClass('safari-browser');
	}

	if (getQueryParam(location.href, 'purchase')) {
		openAsyncModal(
			import(/* webpackChunkName: "PurchaseSuccess" */ '../containers/PurchaseSuccess')
		);
	}

	if (getQueryParam(location.href, 'qr') || location.hostname === 'get.coin.kred') {
		openAsyncModal(
			import(/* webpackChunkName: "QRScanner" */ '../containers/QRScanner')
			);
	}
	userSetup(function (){
		if (!isUserLoggedIn()) {
			return;
		}
		limits(function (error, limits) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			if (limits && limits.kyc && !limits.kyc.hold_tokens) {
				//Black listed places
				$('#app').before('<div class="alert alert-warning regulations-alert alert-dismissable fade show" style="max-width: 100%; border-radius: 0;padding: 15px;">' +
				'<button type="button" class="close" data-dismiss="alert" aria-label="Close" style="color: #fff"><span aria-hidden="true">&times;</span></button>' +
				'Thank you for signing up for ' + (window.branding && window.branding.tldCaps || 'Coin.Kred') + '.<br/>' +
				'Your local regulations prohibit us from giving or selling you CƘr, so you can\'t create Coins at this time. ' +
				'We will email you if those regulations change.' +
				'</div>');
				return;
			}
		});

		var wallet,
			ethWallet,
			aboutText = window.branding && window.branding.ck_nav_about_text || 'About Crypto.Ƙred',
			aboutUrl = window.branding && window.branding.ck_nav_about_url || 'https://www.' + (window.branding && window.branding.tldCaps || 'Coin.Kred'),
			$coinIcon = '<a class="dropdown-toggle count-info" style="padding: 15px 5px 9px;" data-toggle="dropdown" href="#">' +
			'<i class="fa fa-bars"></i>' +
			'</a>';

		$('#nav_user').before('<li id="nav_coin" class="dropdown " style="margin-left: 0; padding: 0;"> ' +
		$coinIcon +
		'<ul class="dropdown-menu dropdown-user dropdown-message list-group">' +
		//'<li class="list-group-item row">' +
		//'<a class="route-open" data-route-path="/marketplace"><i class="fas fa-shopping-cart visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>Marketplace</span></a>' +
		//'</li>' +
		//'<li class="list-group-item row collection-item">' +
		//'<a class="route-open" data-route-path="/collection"><i class="fas fa-th visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>Collection</span></a>' +
		//'</li>' +
		//'<li class="list-group-item row">' +
		//'<a class="route-open" data-route-path="/newsfeed"><i class="fas fa-th visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>Newsfeed</span></a>' +
		//'</li>' +
		'<li class="list-group-item row createacoin-open">' +
		'<a><i class="fas fa-magic visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>Create a Coin</span></a>' +
		'</li>' +
		'<li class="list-group-item row design-item">' +
		'<a class="route-open" data-route-path="/collection/designs"><i class="far fa-edit visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>Saved Designs</span></a>' +
		'</li>' +
		//'<li class="list-group-item row claimacoin-open">' +
		//'<a><i class="fas fa-sign-in-alt visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>Claim a Coin</span></a>' +
		//'</li>' +
		'<li class="list-group-item row transactionhistory-open">' +
		'<a><i class="fas fa-history visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>Transaction History</span></a>' +
		'</li>' +
		// '<li class="list-group-item row outreachmodal-open">' +
		// '<a><i class="fas fa-share-square visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>Outreach</span></a>' +
		// '</li>' +
		// '<li class="list-group-item row tipsandtricks-open">' +
		// '<a><i class="fas fa-lightbulb visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>Tips & Tricks</span></a>' +
		// '</li>' +
		'<li class="list-group-item row">' +
		'<a href="https://intercom.help/peoplebrowsr/kred-coins" target="_blank"><i class="fas fa-question-circle visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>Help Center</span></a>' +
		'</li>' +
		'<li class="list-group-item row">' +
		'<a href="' + aboutUrl + '" target="_blank"><i class="fas fa-info-circle visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>' + aboutText + '</span></a>' +
		'</li>' +
		//'<li class="list-group-item row visible-xs-block">' +
		//'<a  data-toggle="modal" data-target="#inboxModal"><i class="fas fa-inbox" style="margin: 0 13px 0 3px;"></i>' +
		//'<span>Inbox</span></a>' +
		//'<span class="icon-newmail app_widgets_topbar_inbox_icon-count hide" style="color:#fff;background: red;border-radius: 40px;padding: 2px 5px;margin-left: 10px;"></span>' +
		//'</li>' +
		'</ul>' +
		'</li>');

		if (location.hostname.match(/home\.kred/)) {
			$('#nav_appswitcher').find('.home-url').hide();
			$('#nav_coin').find('.home-url').hide()
		} else if (location.hostname.match(/coin\.kred/)) {
			$('#nav_appswitcher').find('.crypto-url').hide();
			$('#nav_coin').find('.crypto-url').hide()
		} else if (location.hostname.match(/empire\.kred/)) {
			$('#nav_appswitcher').find('.empire-url').hide();
			$('#nav_coin').find('.empire-url').hide()
		} else if (location.hostname.match(/kitty\.kred/)) {
			$('#nav_appswitcher').find('.kitty-url').hide();
			$('#nav_coin').find('.kitty-url').hide()
		}

		if (navigator.platform.substr(0,2) === 'iP'){
			var lte9 = /constructor/i.test(window.HTMLElement),
				idb = !!window.indexedDB;

			if ((window.webkit && window.webkit.messageHandlers) || !lte9 || idb) {
				//Hide other apps and my account for Noopur
				$('#navbarRightMenu #nav_appswitcher, #navbarRightMenu #nav_user').hide();
			}
		}

		async.auto({
			wallets: function (next) {
				return getWallets('', next);
			},
			balance: ['wallets', function (res, next) {
				wallet = _.first(res.wallets);
				ethWallet = _.find(res.wallets, function (wallet) {
					return wallet.platform === 'ethereum';
				});
				if (!wallet) {
					//return $(document.body).trigger('messenger:show', ['error', 'You don\'t have a wallet!']);
					return next();
				}
				return getBalance(wallet.wallet, next);
			}]
		}, function (error, res) {
			var marketplaceURL = !!location.hostname.match(/test\.app\.coin\.kred/) ? 'test.app.coin.kred' : (window.branding && window.branding.ck_global_marketplace ? location.hostname : 'app.coin.kred'),
				user = getUser(),
				balance = res.balance,
				roundBalance = balance ? round(balance.unminted_amount, 2) : 0;

			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			if (!wallet || !balance) {
				return;
			}

			if (navigator.platform.substr(0,2) === 'iP'){
				var lte9 = /constructor/i.test(window.HTMLElement),
					idb = !!window.indexedDB;

				if ((window.webkit && window.webkit.messageHandlers) || !lte9 || idb){
					//WKWebView
					$('#nav_coin .dropdown-menu').prepend(
						'<li class="nav-user-menu list-group-item row d-sm-none" data-nav_user-menu-item="" style="">' +
								'<a href="https://' + user.home + '/collection" class="profile-link">' +
									'<div class="avatar img-squircle-small user-avatar" style="height: 24px; width: 24px; margin-right: 10px; padding: 0px; border-radius: 100%; background-size: cover; background-position: center center; background-image: url(&quot;' +
									getAvatar(user) + '&quot;);"></div>' +
									'<span class="user-name">' + formatDisplayName(user) + '</span>' +
								'</a>' +
						'</li>' +
						'<li class="list-group-item row buymore-item">' +
						'<a style="display: inline-block"><img class="visible-xs-inline-block" src="https://d30p8ypma69uhv.cloudfront.net/cryptokred-images/unb-coins.svg" ' +
						'style="vertical-align: top; width: 20px; filter: invert(0.3); margin: 0 10px 0 3px;"/>&nbsp;<span style="font-size:12px;" class="transactionhistory-open"><span class="navbar-unminted-coins">' + roundBalance + '</span> <span>CƘr</span></span>' +
						'<a class="pull-right" href="/buy" target="_blank" style="display: inline-block"><span class="pull-right buymore-coins">Buy More <i class="fas fa-angle-right"></i></span></a>' +
						'</a>' +
						'</li>');
				}
			} else {

				$('#nav_coin .transactionhistory-open').after('<li class="list-group-item row connectethwallet-open">' +
				'<a><i class="fas fa-link visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span class="connectethwallet-title">' + (!!ethWallet ? 'Update' : 'Connect') + ' my ETH Wallet</span></a>' +
				'</li>' +
				'<li class="list-group-item row exportckr-open">' +
				'<a><i class="fas fa-sign-out-alt visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>Export CƘr</span></a>' +
				'</li>');

				$('#nav_coin .dropdown-menu').prepend(
					'<li class="nav-user-menu list-group-item row d-sm-none" data-nav_user-menu-item="" style="">' +
							'<a href="https://' + user.home + '/collection" class="profile-link">' +
								'<div class="avatar img-squircle-small user-avatar" style="height: 24px; width: 24px; margin-right: 10px; padding: 0px; border-radius: 100%; background-size: cover; background-position: center center; background-image: url(&quot;' +
								getAvatar(user) + '&quot;);"></div>' +
								'<span class="user-name">' + formatDisplayName(user) + '</span>' +
							'</a>' +
					'</li>' +
					'<li class="list-group-item row buymore-item">' +
					'<a style="display: inline-block"><img class="visible-xs-inline-block" src="https://d30p8ypma69uhv.cloudfront.net/cryptokred-images/unb-coins.svg" ' +
					'style="vertical-align: top; width: 20px; filter: invert(0.3); margin: 0 10px 0 3px;"/>&nbsp;<span style="font-size:12px;" class="transactionhistory-open"><span class="navbar-unminted-coins">' + roundBalance + '</span> <span>CƘr</span></span>' +
					'<a class="route-open pull-right" data-route-path="/buy" style="display: inline-block"><span class="pull-right buymore-coins">Buy More <i class="fas fa-angle-right"></i></span></a>' +
					'</a>' +
					'</li>');
			}

			$('#nav_coin .route-open, .container-fluid .route-open').click(function (event) {
				event.preventDefault();
				$('.ic-minimize').trigger('click');
				var path = $(this).attr('data-route-path'),
					url = path.match('/marketplace/all') && (window.branding && window.branding.ck_global_marketplace) ? '/' : path;

				if ((window.branding && window.branding.ck_global_marketplace) || location.hostname === 'localhost') {
					history.push(url);
				} else {
					window.open('https://' + marketplaceURL + url, '_self');
				}
			});

			$('#nav_coin .claimacoin-open').click(function (event) {
				if (requireLogin()) {
					return;
				}

				openAsyncModal(
					import(/* webpackChunkName: "ClaimACoin" */ '../containers/ClaimACoin'),
					{ wallet }
				);
			});

			$('#nav_coin .outreachmodal-open').click(function () {
				if (requireLogin()) {
					return;
				}

				openAsyncModal(
					import(/* webpackChunkName: "OutreachModal" */ '../containers/OutreachModal'),
					{ user: getUser() }
				);
			});

			$('#nav_coin .connectethwallet-open').click(function () {
				if (requireLogin()) {
					return;
				}

				// do it this way so we can do the Ajax request concurrently
				const loadImport = import(/* webpackChunkName: "ConnectEthWallet" */ '../containers/ConnectEthWallet');

				return getWallets('', function (error, wallets) {
					if (error) {
						return $(document.body).trigger('messenger:show', ['error', error]);
					}

					var ethWallet = _.find(wallets, function (wallet) {
						return wallet.platform === 'ethereum';
					});

					openAsyncModal(loadImport, { loggedInUser: getUser(), ethWallet: ethWallet || null });
				});
			});

			$('#nav_coin .exportckr-open').click(function () {
				if (requireLogin()) {
					return;
				}

				openAsyncModal(
					import(/* webpackChunkName: "ExportCKr" */ '../containers/ExportCKr'),
					{ loggedInUser: getUser(), wallet, balance }
				);
			});

			$('#nav_coin .tipsandtricks-open').click(function () {
				$('#chmln-dom .chmln-bubble').show();
			});

			$('#nav_coin .transactionhistory-open').click(function () {
				if (requireLogin()) {
					return;
				}

				openAsyncModal(
					import(/* webpackChunkName: "TransactionHistory" */ '../containers/TransactionHistory'),
					{ loggedInUser: getUser() }
				);
			});

			$('#nav_coin .createacoin-open').click(function (event) {
				openCreateACoinModal({ user, wallet });
			});

			if (user && user.data && !user.data.tweetCkr && !user.data.tweetCkrShown && !localStorage.getItem('shownTweet') && balance.minted_coins >= 1) {
				openAsyncModal(
					import(/* webpackChunkName: "TwitterPromo" */ '../containers/TwitterPromo'),
					{ wallet }
				);

				localStorage.setItem('shownTweet', '1');
			}

			if (localStorage.getItem('newKredCoins')) {
				$(document.body).trigger('messenger:show', ['message', "Kred sent you 5 You've Influenced Me Coins"]);
				localStorage.removeItem('newKredCoins');
			}

			$(document.body)
				.on('balanceUpdate:init', function () {
					return getBalance(wallet.wallet, function (error, balance) {
						if (error) {
							return $(document.body).trigger('messenger:show', ['error', error]);
						}
						console.log('Crypto Kred Check balance', balance);
						if (!balance) {
							return;
						}

						$('#nav_coin .navbar-unminted-coins').html(round(balance.unminted_amount, 2));
					});
				})
			;

			document.addEventListener('giveACoin:init', function (event) {
				/** recipientData = {
							recipientName: 'Angela',
							recipientType: 'email'/'domain'/'sms,
							recipient: 'angelaung@peoplebrowsr.com'/'angela.kred'/'+61412341234'
						}
				 **/
				var recipientData = event.detail;

				openGiveACoinModal({
					coin: {},
					skipRecipientInput: !!recipientData,
					recipientData: recipientData
				});
			});

			//Give A Coin pop up example
			//var event = new CustomEvent('giveACoin:init', {
			//	detail: {
			//		recipientName: 'Angela',
			//		recipientType: 'email',
			//		recipient: 'angelaung@peoplebrowsr.com'
			//	}
			//});
			//document.dispatchEvent(event);

			getCryptoKitties(1, {}).then(function (kitties) {
				if (kitties && !!kitties.length) {
					$('#nav_coin .design-item').after('<li class="list-group-item row">' +
					'<a class="route-open" data-route-path="/collection/kitties"><i class="fas fa-paw visible-xs-inline-block" style="margin: 0 13px 0 3px;"></i><span>Coinify your CryptoKitty</span></a>' +
					'</li>');

					if (location.pathname.match(/(marketplace|collection)/) && !location.pathname.match(/collection\/kitties/)) {
						$('.container-fluid').prepend('' +
						'<div class="alert alert-info alert-dismissible fade show" style="max-width: 1280px;margin: 10px auto;">' +
						'<a class="route-open" data-route-path="/collection/kitties">You have CryptoKitties! Click here to Coinify your kitties</a>' +
						'<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
						'<span aria-hidden="true">&times;</span>' +
						'</button>' +
						'</div>');
					}
				}
				$('#nav_coin .route-open, .container-fluid .route-open[data-route-path="/collection/kitties"]').click(function (event) {
					event.preventDefault();
					$('.ic-minimize').trigger('click');
					var path = $(this).attr('data-route-path'),
						url = path.match('/marketplace/all') && (window.branding && window.branding.ck_global_marketplace) ? '/' : path;

					if ((window.branding && window.branding.ck_global_marketplace) || location.hostname === 'localhost') {
						history.push(url);
					} else {
						window.open('https://' + marketplaceURL + url, '_self');
					}
				});
			});
		});
	});
};

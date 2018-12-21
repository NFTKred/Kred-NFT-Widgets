import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';

import { isUserLoggedIn, getUser } from '../js/auth';

import Coin, { CoinPlaceholder } from './Coin';

import CoinProfileModal from './CoinProfileModal'
import CirculationModal from './CirculationModal';
import CommentPostBox from './CommentPostBox'

import {timeDifference, round, formatDisplayName, checkIfMobile} from '../js/helpers';
import {getWallets, cancelAuctionOrSale, cancelBatchAuctionOrSale, likeCoin, unlikeCoin, requestCoin, getRequests, addToMarket, removeFromMarket,
	deleteDraftCoin} from '../js/grab';
import { sendGrid } from '../js/sos';
import { history } from '../js/history';

import '../css/coin';
import 'animate.css';

class Coins extends Component {
	constructor(props) {
		super(props);

		this.state = {
			requests: []
		};
	}
	checkRequests() {
		var _this = this;
		if (isUserLoggedIn()) {
			return getRequests({user: getUser().id, count: 100}, function (error, requests) {
				if (error) {
					return;
				}

				_this.setState({
					requests: requests
				});
			});
		}
	}
	viewProfile(coin) {
		var url;
		if (coin.draft || coin.kitty) {
			return;
		}
		if (this.props && this.props.batched && coin.coins > 1) {
			if (location.pathname.match(/\/tag/)) {
				url = location.pathname + "/batch/" + coin.batch;
			} else if (location.pathname.match(/marketplace$/)) {
				url = "/marketplace/batch/" + coin.batch;
			} else if (location.pathname.match(/collection/)) {
				url = "/collection/batch/" + coin.batch + "/" + coin.user;
			} else {
				url = "/marketplace/all/batch/" + coin.batch;
			}
			return this.route(url);
		}
		return this.route("/coin/" + coin.symbol + "/" + coin.sequence);
	}
	route(url) {
		history.push(url);
	}
	previewCoin(coin) {
		var url = '/coin/' + coin.symbol + '/' + coin.sequence;
		if (coin.draft || coin.kitty) {
			return;
		}

		// if (this.props.batched && coin.coins > 1) {
		// 	if (location.pathname.match(/\/tag/)) {
		// 		url = location.pathname + "/batch/" + coin.batch;
		// 	} else if (location.pathname.match(/marketplace$/)) {
		// 		url = "/marketplace/batch/" + coin.batch;
		// 	} else if (location.pathname.match(/collection/)) {
		// 		url = "/collection/batch/" + coin.batch + "/" + coin.user;
		// 	} else {
		// 		url = "/marketplace/all/batch/" + coin.batch;
		// 	}
		// 	return this.route(url);
		// }
		const modal = document.createElement('div');
		modal.className = 'coin-action-modals';
		document.body.appendChild(modal);

		if (checkIfMobile()) {
			return this.route(url);
		}

		ReactDOM.render(<CoinProfileModal viewOnly={this.props.viewOnly} loggedInUser={getUser()} route={this.route} coin={coin} viewProfile={this.viewProfile}/>, modal);
		$('.coinprofile-modal').modal('show');
	}
	likeOrUnlike(event, coin) {
		var _this = this;

		if (_this.props.viewOnly) {
			return;
		}

		if (!isUserLoggedIn()) {
			return $('.signup-modal').modal({
				show: true,
				backdrop: 'static'
			});
		}

		var $like = $(event.target).closest('.coin-item-likes');
		$like.find('.fa-heart').addClass('animate-pulse');

		if ($like.find('.fa-heart').hasClass('liked')) {
			return unlikeCoin(coin.coin, function (error, coin) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				$like.find('.fa-heart').removeClass('animate-pulse').removeClass('liked');
				$like.find('.coin-item-likes-count').html(!!coin.likes ? ' ' + coin.likes : '');
				//$(document.body).trigger('coinAction:done');
			});
		} else {
			return likeCoin(coin.coin, function (error, coin) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				$like.find('.fa-heart').removeClass('animate-pulse').addClass('liked');
				$like.find('.coin-item-likes-count').html(!!coin.likes ? ' ' + coin.likes : '');
				//$(document.body).trigger('coinAction:done');
			});
		}
	}
	requestCoin(event, coin) {
		if (!isUserLoggedIn()) {
			return $('.signup-modal').modal({
				show: true,
				backdrop: 'static'
			});
		}

		var _this = this,
			$button = $(event.target);

		$button.html('Requesting...');

		return getWallets(getUser().id, function (error, wallets) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			var wallet = _.first(wallets);
			if (!wallet) {
				return $(document.body).trigger('messenger:show', ['error', 'You have no wallet!']);
			}
			requestCoin(coin.coin, wallet.wallet, function (error, request) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				//$(document.body).trigger('coinAction:done');
				$button.html('Requested');
				sendGrid({
					sender: 'contact@peoplebrowsr.ceo',
					to: coin.user,
					subject: coin.name,
					template: '3f2d527c-fa31-4518-9d6f-fd5d4688d5bf',
					data: {
						REQUESTOR: formatDisplayName(getUser()),
						COINID: coin.coin,
						COINNAME: coin.name,
						GIVECOINLINK: 'https://' + location.hostname + '/coin/' + coin.symbol + '/' + coin.sequence + '?viewrequests=1',
						'-channel-': 'Coin.Kred',
						'-channelurl-': 'app.coin.kred'
					}
				}, function (error, request) {
					if (error) {
						return $(document.body).trigger('messenger:show', ['error', error]);
					}
					return $(document.body).trigger('messenger:show', ['message', 'Request has been sent!']);
				});
			});
		});
	}
	cancelAllMarketplace(obj) {
		if (!isUserLoggedIn()) {
			return $('.signup-modal').modal({
				show: true,
				backdrop: 'static'
			});
		}

		cancelBatchAuctionOrSale(obj.batch || obj.coin.batch, function (error, coin) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$(document.body).trigger('coinAction:done');
		});
	}
	cancelMarketplace(obj) {
		if (!isUserLoggedIn()) {
			return $('.signup-modal').modal({
				show: true,
				backdrop: 'static'
			});
		}

		cancelAuctionOrSale(obj.auction || '', obj.sale || '', function (error, coin) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$(document.body).trigger('coinAction:done');
		});
	}
	toggleNSFW(event) {
		if (!isUserLoggedIn()) {
			return $('.signup-modal').modal({
				show: true,
				backdrop: 'static'
			});
		}

		var _this = this,
			$nsfw = $(event.target),
			$coinItem = $nsfw.closest('.coin-item'),
			coinId = $coinItem.attr('data-coin-id'),
			btnText = $nsfw.html(),
			coin = _.find(_this.props.coins, function (coin) {
				return coin.coin === parseInt(coinId);
			}),
			isNSFW = coin && coin.nsfw ? 'NSFW' : 'Flagged';

		$coinItem.find('.coin-item-img').toggleClass('nsfw-filter');
		$nsfw.html((btnText === ('Show ' + isNSFW) ? 'Hide ' : 'Show ') + isNSFW);
	}
	addToMarket(coin) {
		addToMarket(coin.coin, function (error, coin) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$(document.body).trigger('coinAction:done');
		});
	}
	removeFromMarket(coin) {
		removeFromMarket(coin.coin, function (error, coin) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$(document.body).trigger('coinAction:done');
		});
	}
	hasNewPost(newMessage) {
		//message has been posted. show message and remove box
		if (newMessage) {
			$('.modal-backdrop').remove();
			$('.coin-action-modals').remove();
			return $(document.body).trigger('messenger:show', ['message', 'Comment posted!']);
		}
	}
	addComment(coin) {
		var _this = this;

		if (_this.props.viewOnly) {
			return;
		}

		if (!isUserLoggedIn()) {
			return $('.signup-modal').modal({
				show: true,
				backdrop: 'static'
			});
		}

		//check if member
		if (!coin.is_member) {
			return $(document.body).trigger('messenger:show', ['warn', 'Request or buy this Coin to add a Comment']);
		}

		if ($('.coin-action-modals').length) {
			$('.coin-action-modals').remove();
		}

		const modal = document.createElement('div');
		modal.className = 'coin-action-modals';
		document.body.appendChild(modal);

		ReactDOM.render(<CommentPostBox coin={coin} hasNewPost={this.hasNewPost}/>, modal);
		$('.commentpostbox-modal').modal('show');
	}
	viewCirculation(coin) {
		var _this = this;

		if (_this.props.viewOnly) {
			return;
		}

		if (!isUserLoggedIn()) {
			return $('.signup-modal').modal({
				show: true,
				backdrop: 'static'
			});
		}

		var _this = this;
		const modal = document.createElement('div');
		modal.className = 'coin-action-modals';
		document.body.appendChild(modal);

		ReactDOM.render(<CirculationModal
			loggedInUser={getUser()}
			coin={coin}
		/>, modal);
		$('.circulationmodal-modal').modal('show');
	}
	deleteDraft(e, coin) {
		var _this = this;

		$(e.target).addClass('animate-pulse');

		deleteDraftCoin(coin.draft, function (error) {
			$(e.target).removeClass('animate-pulse');
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$('.coin-item[data-coin-draft="' + coin.draft + '"]').remove();
		});
	}
	render() {
		const {
			coins,
			disableHover,
			batched,
			path,
			className,
			viewOnly
			} = this.props;

		return (
			<div className={`row ${className || ''}`}>
				{coins.map((obj, index) => {
					var coin = !_.isObject(obj.coin) ? obj : Object.assign({}, obj.coin, {
							sale: obj.sale,
							auction: obj.auction
						}),
						amOwner = getUser().id === coin.user,
						requestStatus = coin.requested ? 'Requested' : 'Request',
						price = obj.sale ? (obj.sale_price || obj.price) : (obj.auction ? (obj.auction_price || obj.price) : (coin.last_sale || obj.price)),
						nsfw = !!coin.nsfw || !!coin.flagged || 0;

					return (
						<div className={
						"col col-sm-6 col-md-4 col-lg-3 coin-item text-center" +
						(disableHover ? ' disableHover-coin' : '')
							}
							data-coin-id={coin.coin}
							data-coin-draft={coin.draft}
							key={index}
						>
						{/*!!myMarketplaceShop && !obj.inMyShop && !amOwner && (coin.sale || coin.auction) && (
							<span className="coin-item-add" onClick={() => this.addToMarket(coin)} title="Add to marketplace"><i className="fas fa-plus"></i></span>
						)*/}
						{/*((!!domainMarketplaceShop && marketplaceOwner.id === getUser().id) || (!!myMarketplaceShop && !!obj.inMyShop)) && !amOwner && (
							<span className="coin-item-remove" onClick={() => this.removeFromMarket(coin)} title="Hide from marketplace"><i className="fas fa-trash"></i></span>
						)*/}
						{obj.type === 'auction' && obj.end && !batched && (
							<span className="badge badge-pill badge-light coin-item-auctionTime">
								<i className="far fa-clock"></i> {timeDifference(obj.end)}</span>
						)}
						{batched && coin.coins > 1 && (
							<span className="badge badge-pill badge-light coin-item-auctionTime">{coin.coins} {_.isObject(obj.coin) ? 'for sale' : 'coins'}</span>
						)}
						{coin.draft && (
							<span className="coin-item-remove" onClick={(e) => this.deleteDraft(e, coin)} title="Delete Design"><i className="fas fa-trash"></i></span>
						)}
							<div className={"coin-item-img" + (!!nsfw ? ' nsfw-filter' : '')}>
								<div className="coin-item-backshadow"></div>
								<a onClick={() => {
									this.previewCoin(coin)
								}}>
									<div className="flip-container">
										<div className="flipper">
											<div className="front">
												{coin.placeholder ? <CoinPlaceholder width="215"/> : <Coin
													id={coin.coin}
													width="215"
													image={coin.face}
													upperText={coin.name}
													lowerText={coin.value + 'CƘr - \uf0c0 ' + (coin.circulation || 1)}
													backgroundColor={coin.color}
													textColor={coin.text_color}
													pattern={coin.pattern}
													patternColor={coin.pattern_color}
												/>}
											</div>
											<div className="back">
												{coin.placeholder ? <CoinPlaceholder width="215"/> : <Coin
													id={coin.coin}
													width="215"
													image={coin.back && coin.back.match(/^blob/) ? coin.face : coin.back}
													upperText={coin.domain && coin.domain.split('.').length && coin.domain.split('.')[0] || coin.name}
													lowerText={coin.value + 'CƘr - ' + (coin.sequence || 1) + '/' + (coin.count || 1)}
													backgroundColor={coin.color}
													textColor={coin.text_color}
													pattern={coin.pattern}
													patternColor={coin.pattern_color}
												/>}
											</div>
										</div>
									</div>
								</a>
							</div>
							{!!nsfw && (
								<button onClick={this.toggleNSFW.bind(this)} className="btn btn-outline-secondary btn-sm nsfw-show-btn">Show {coin.nsfw ? 'NSFW' : 'Flagged'}</button>
							)}
							<div className="coin-item-details">
								<h4>
									<a onClick={() => {
										this.previewCoin(coin)
									}}>
										{coin.name}
									</a>
								</h4>
								{!coin.draft && !coin.kitty && (
									<div className="coin-stats">
										<span>
											<span className="divider"></span>
											<span className="coin-item-likes" onClick={(event) => {
												this.likeOrUnlike(event, coin)
											}}>
												<i className={"fas fa-heart" + (!!coin.liked ? ' liked' : '')}></i>
												<span className="coin-item-likes-count"> {coin.likes || ''}</span>
											</span>
										</span>

										<span>
											<span className="divider"></span>
											<span className="coin-item-comment" onClick={() => this.addComment(coin)}>
												<i className="fas fa-comment"></i>
												<span className="coin-item-comment-count"> {coin.comments || ''}</span>
											</span>
										</span>

										<span>
											<span className="divider"></span>
											<span className="coin-item-circulation" onClick={() => this.viewCirculation(coin)}>
												<i className="fas fa-users"></i>
												<span className="coin-item-circulation-count"> {coin.circulation || ''}</span>
											</span>
										</span>
									</div>
								)}

								{!batched && obj.action && obj.from && (
									<p className="badge badge-pill badge-secondary">
									{obj.method === 'buy' ? obj.to && obj.to.name : obj.from.name}
										{obj.action === 'create' ? ' created this coin' : '' }
										{obj.action === 'hold' ? (' gave this to ' + (obj.to && obj.to.name)) : '' }
										{obj.action === 'receive' ? (' received from ' + (obj.to && obj.to.name || '')) : '' }
										{obj.action === 'request' ? ' requested this coin' : '' }
										{obj.action === 'collect' ? ' collected' : '' }
										{obj.action === 'like' ? ' liked' : '' }
										{obj.action === 'comment' ? ' commented' : '' }
										{obj.action === 'buy' ? ' bought' : '' }
										{obj.action === 'sell' ? ' put up for sale' : '' }
										{obj.action === 'auction' ? ' put up for auction' : '' }
										{obj.method === 'buy' ? (' purchased from ' + (obj.from.name || '')) : '' }
										{(obj.action === 'send' && !obj.method) || obj.method === 'gift' || obj.method === 'send' ? (' gifted ' + (obj.to && obj.to.name || '')) : '' }
										{obj.action === 'change' ? ' updated' : '' }
										{obj.action === 'cancel' ? ' cancelled' : '' }
										{obj.action === 'cancel' && obj.sale ? ' sale' : '' }
										{obj.action === 'cancel' && obj.auction ? ' auction' : '' }</p>
								)}
							</div>
						</div>
					);
				})}
			</div>
		)
	}
}

export default Coins;

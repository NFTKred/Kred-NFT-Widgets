import React from 'react';
import ReactDOM from 'react-dom';
import async from 'async';
import _ from 'underscore';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import tinycolor from 'tinycolor2';

import coinProfileCss from '../css/coinProfile';
import Coin from './Coin';
import CoinFrontBack from './CoinFrontBack';
import CoinCommentsSettings from './CoinCommentsSettings';

import { CoinProfileMeta } from './CoinProfileMeta';
import CoinValue from './CoinValue';

import { openShareModal } from './ShareModal';

import RequestsModal from './RequestsModal';
import CirculationModal from './CirculationModal';

import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'

import {timeDifference, objectifyForm, getAvatar, formatDisplayName, getQueryParam, round, checkIfMobile} from '../js/helpers';
import {user} from '../js/auth';
import {getCoin, getWallets, getWalletCoins, getFreshRequests, getMarket, getCoinOwners,
	requestCoin, likeCoin, unlikeCoin, hideCoin, showCoin, cancelAuctionOrSale, tagCounts} from '../js/grab';
import { sendGrid } from '../js/sos';

var requestCheck;

const CoinProfile = React.createClass({
	getInitialState() {
		return {
			isLoading: true,
			user: this.props.loggedInUser,
			creatorUser: {},
			ownerUser: {},
			isOwner: false,
			isCreator: false,
			hasOwned: false,
			coin: {},
			requests: [],
			history: [],
			market: {},
			coinLinks: {},
			liking: false,
			requestStatus: 'Request',
			pageSize: $(window).width() > 768 ? 'desktop' : 'mobile',
			tagCounts: []
		};
	},
	componentDidMount() {
		var _this = this;

		window.addEventListener('resize', this.resize);

		$(document.body).on('coinAction:done', function () {
			_this.loadData(_this.props);
		});

		//Check if requesting coin
		if (getQueryParam(location.href, 'request') || localStorage.getItem('request')) {
			_this.requestACoin();
		}

		//Check if buying coin
		if (getQueryParam(location.href, 'buy') || localStorage.getItem('buy')) {
			_this.buyACoin();
		}
	},
	resize(event) {
		var _this = this;
		if ($(window).width() > 768) {
			_this.setState({
				pageSize: 'desktop'
			});
		} else {
			_this.setState({
				pageSize: 'mobile'
			});
		}
	},
	componentWillMount() {
		this.loadData(this.props);
	},
	componentWillReceiveProps(nextProps) {
		clearInterval(requestCheck);
		this.setState({
			requests: [],
			history: [],
			creatorUser: {},
			ownerUser: {}
		});
		this.loadData(nextProps);
	},
	loadData(props) {
		//Get coin
		var _this = this,
			walletCoins = [];

		return async.auto({
			'getCoin': function (next) {
				return getCoin({symbol: props.coinSymbol, sequence: props.sequence}, function (error, coin) {
					if (error) {
						return next(error);
					}

					_this.setState({
						isLoading: false,
						isOwner: props.loggedInUser.id === coin.user,
						isCreator: props.loggedInUser.id === coin.creator,
						coin: coin,
						tags: _.compact(_.map(coin.tags, function (tag) {
							return tag.replace(/^(audience|topic):/, '')
						})) || []
					});
					return next(null, coin);
				});
			},
			'history': ['getCoin', function (res, next) {
				return getCoinOwners(res.getCoin.coin, next);
			}],
			'creatorUser': ['getCoin', function (res, next) {
				return user((res.getCoin.creator || res.getCoin.user), function (error, user) {
					if (error) {
						return next(error);
					}
					_this.setState({
						creatorUser: user
					});
					return next(null, user);
				});
			}],
			'ownerUser': ['getCoin', function (res, next) {
				if (res.getCoin.creator === res.getCoin.user) {
					return next();
				}
				return user(res.getCoin.user, function (error, user) {
					if (error) {
						return next(error);
					}
					_this.setState({
						ownerUser: user
					});
					return next(null, user);
				});
			}],
			tagCounts: ['getCoin', function (res, next) {
				if (res.getCoin && res.getCoin.tags) {
					return tagCounts({tags: res.getCoin.tags.join(',')}, function (error, tagCounts) {
						if (error) {
							return next(error);
						}
						_this.setState({
							tagCounts: tagCounts || []
						});
						return next(null, tagCounts);
					});
				}
				return next();
			}],
			'market': ['getCoin', function (res, next) {
				if (res.getCoin && !res.getCoin.auction && !res.getCoin.sale) {
					return next();
				}
				return getMarket({coin: res.getCoin.coin, status: 'active'}, next);
			}],
			'walletCoins': ['getCoin', function (res, next) {
				return getWalletCoins(res.getCoin.wallet, null, null, {count: 500, nsfw: true, flagged: true, minted: true}, function (error, coins) {
					if (error) {
						return next(error);
					}
					walletCoins = _.filter(coins || [], function (coin) {
						return coin.symbol && coin.sequence;
					});

					_this.setState({
						walletCoins: walletCoins,
						coinLinks: _this.getCoinLinks(walletCoins)
					});
					return next(null, walletCoins);
				});
			}],
			'requests': ['getCoin', function (res, next) {
				return getFreshRequests({coin: res.getCoin.coin}, next);
			}]
		}, function (error, res) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			_this.setState({
				requests: res.requests,
				history: res.history,
				market: _.first(res.market) || {},
				hasOwned: _this.state.isOwner || !!_.find(res.history, function (history) {
					return history.user === props.loggedInUser.id && history.action !== 'request';
				}),
				requestStatus: 'Request'
			});

			//If user's name is in requests list, disable request btn
			if (!_this.state.isOwner && !_this.state.coin.auction && !_this.state.coin.sale &&
				_.find(res.requests, function (request) {
					return request.user === props.loggedInUser.id;
				})) {
				_this.setState({
					requestStatus: 'Requested'
				});
			}

			if (!props.loggedInUser.id) {
				ReactDOM.render(React.createElement(CoinFrontBack, {
					width: '200',
					coin: _this.state.coin
				}), document.getElementById('claim-coin-container'));

				$('.signup-modal .signup-modal-logo .newkred-hasNoCoin').hide();
				$('.signup-modal .signup-modal-logo .newkred-hasCoin').show();
			}

			//Check if view coin requests
			if (getQueryParam(location.href, 'viewrequests') || localStorage.getItem('viewrequests')) {
				_this.viewRequests();
			}

			requestCheck = setInterval(function () {
				if (!!$('.coinprofile-coin-container').find('[data-coin-id="' + res.getCoin.coin + '"]')) {
					return getFreshRequests({coin: res.getCoin.coin}, function (error, requests) {
						if (error) {
							return $(document.body).trigger('messenger:show', ['error', error]);
						}
						_this.setState({
							requests: requests
						});
					});
				}
			}, 30000);
		});

	},
	getCoinLinks(walletCoins) {
		const getThisCoinIndex = this.getCoinIndex(walletCoins);

		return {
			previous: this.getCoinURL(walletCoins[getThisCoinIndex - 1]),
			next: this.getCoinURL(walletCoins[getThisCoinIndex + 1])
		}
	},
	getCoinIndex(coins) {
		var coin = this.state.coin;

		for (var i = 0; i < coins.length; i++) {
			if (coins[i].symbol === coin.symbol &&
				coins[i].sequence === coin.sequence) {
				return i;
			}
		}
	},
	getCoinURL(coin) {
		if (coin) {
			return `/coin/${coin.symbol}/${coin.sequence}`;
		}
	},
	requestACoin($target) {
		var _this = this;

		return getCoin({symbol: _this.props.coinSymbol, sequence: _this.props.sequence}, function (error, coin) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['message', error]);
			}
			var code = getQueryParam(location.href, 'request') || coin.code;

			localStorage.setItem('request', code);

			if (!_this.props.loggedInUser.id) {
				$('.signup-modal').modal({
					show: true,
					backdrop: 'static'
				});
				return $(document.body).trigger('messenger:show', ['message', 'Log in or Sign up to Request this Coin']);
			}

			if (code !== coin.code) {
				return $(document.body).trigger('messenger:show', ['error', 'Invalid request code!']);
			}

			if ($target && $target.hasClass('disabled')) {
				return;
			}

			return getWallets(_this.props.loggedInUser.id, function (error, wallets) {
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
					_this.setState({
						requestStatus: 'Requested'
					});
					localStorage.removeItem('request');
					$(document.body).trigger('coinAction:done');
					sendGrid({
						sender: 'contact@peoplebrowsr.ceo',
						to: coin.user,
						subject: coin.name,
						template: '3f2d527c-fa31-4518-9d6f-fd5d4688d5bf',
						data: {
							REQUESTOR: formatDisplayName(_this.props.loggedInUser),
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
		});
	},
	requestCoin(event) {
		event.preventDefault();

		var _this = this,
			$target = $(event.target);

		if (!_this.props.loggedInUser.id) {
			return $('.signup-modal').modal({
				show: true,
				backdrop: 'static'
			});
		}

		_this.requestACoin($target);
	},
	onShare(event) {
		var _this = this;

		openShareModal({
			text: ['Take a look at the', _this.state.coin && _this.state.coin.name, 'Coin'].join(' ')
		});
	},
	likeOrUnlike(event) {
		var _this = this,
			coinId = _this.state.coin.coin;

		if (!_this.props.loggedInUser.id) {
			return $('.signup-modal').modal({
				show: true,
				backdrop: 'static'
			});
		}

		_this.setState({liking: true});

		if (_this.state.coin.liked) {
			return unlikeCoin(coinId, function (error, coin) {
				_this.setState({
					liking: false
				});
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				$(document.body).trigger('coinAction:done');
			});
		} else {
			return likeCoin(coinId, function (error, coin) {
				_this.setState({
					liking: false
				});
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				$(document.body).trigger('coinAction:done');
			});
		}
	},
	viewRequests(event) {
		var _this = this;

		if (!_this.props.loggedInUser.id) {
			return $('.signup-modal').modal({
				show: true,
				backdrop: 'static'
			});
		}

		if (!_this.state.isOwner) {
			return;
		}

		const modal = document.createElement('div');
		modal.className = 'coin-action-modals';
		document.body.appendChild(modal);

		ReactDOM.render(<RequestsModal
			loggedInUser={this.props.loggedInUser}
			coin={_this.state.coin}
			requests={_this.state.requests}
		/>, modal);
		$('.requestsmodal-modal').modal('show');
	},
	viewCirculation(event) {
		var _this = this;

		if (!_this.props.loggedInUser.id) {
			return $('.signup-modal').modal({
				show: true,
				backdrop: 'static'
			});
		}
		const modal = document.createElement('div');
		modal.className = 'coin-action-modals';
		document.body.appendChild(modal);

		ReactDOM.render(<CirculationModal
			loggedInUser={this.props.loggedInUser}
			history={_this.state.history}
			coin={_this.state.coin}
		/>, modal);
		$('.circulationmodal-modal').modal('show');
	},
	cancelMarketplace() {
		var _this = this,
			coin = _this.state.coin;

		cancelAuctionOrSale(coin.auction || '', coin.sale || '', function (error, coin) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$(document.body).trigger('coinAction:done');
		});
	},
	goToCoin(link) {
		this.setState({
			isLoading: true
		});
		this.props.history.push(link)
	},
	route(url) {
		this.props.history.push(url);
	},
	render: function () {
		const {
			loggedInUser
			} = this.props;
		const {
			isLoading,
			requests,
			market,
			coin,
			creatorUser,
			ownerUser,
			isCreator,
			isOwner,
			hasOwned,
			coinLinks,
			liking,
			requestStatus,
			pageSize,
			tagCounts
			} = this.state;

		//if (isLoading) {
		//	return;
		//}

		var coinPrice = (coin.auction || coin.sale) && market ? market.price : coin.value,
			color = coin.color ? '#' + coin.color : '#fff',
			actionColor = tinycolor(color).isLight() ? '#555' : '#fff';
		return (
			<div className="coinprofile-container">
				<div className={"coinprofile-header " + (!isLoading && !checkIfMobile() ? 'fade-in-1' : '')}
					style={{
						background: color
					}}>
					<div className={"coinprofile-coin-container " + (!isLoading && !checkIfMobile() ? 'fade-in-1' : '')}>
						{coinLinks.previous && !isLoading &&
						<a className="coinprofile-previous" title="Previous" onClick={()=> this.goToCoin(coinLinks.previous)} style={{
							color: actionColor
						}}>
							<i className="fas fa-angle-left"></i>
						</a>}
						{!isLoading ? (<CoinFrontBack
							width={checkIfMobile() || pageSize === 'mobile' ? 280 : 500}
							coin={coin}
						/>) : null}
						{coinLinks.next && !isLoading &&
						<a className="coinprofile-next" title="Next" onClick={()=> this.goToCoin(coinLinks.next)} style={{
							color: actionColor
						}}>
							<i className="fas fa-angle-right"></i>
						</a>}
						{!isLoading ? (
							<div className="text-center">
								<div className="coinprofile-issuedby">
									<a href={"http://" + coin.domain + "/collection"} target="_blank">
										<div className="issuer-avatar" style={{
											backgroundImage: "url('" + (creatorUser && getAvatar(creatorUser)) + "'), url('https://d30p8ypma69uhv.cloudfront.net/stream/uploads/53756175b7725d370d9a208f_b91f434779e3f4a5f80d4b2373394d83_defaultAvatar.jpg')"
										}}></div>
										<div className="issuedby-details" style={{
											color: actionColor
										}}>
											<p>Issued By</p>
											<h4>{formatDisplayName(creatorUser)}</h4>
										</div>
									</a>
								</div>
						{ownerUser && ownerUser.id && (
							<div className="coinprofile-issuedby" style={{
								borderLeftColor: tinycolor(actionColor).setAlpha(0.5).toRgbString()
							}}>
								<a href={"http://" + ownerUser.home + "/collection"} target="_blank">
									<div className="issuer-avatar" style={{
										backgroundImage: 'url("' + (ownerUser && getAvatar(ownerUser)) + '"), url("https://d30p8ypma69uhv.cloudfront.net/stream/uploads/53756175b7725d370d9a208f_b91f434779e3f4a5f80d4b2373394d83_defaultAvatar.jpg")'
									}}></div>
									<div className="issuedby-details" style={{
										color: actionColor
									}}>
										<p>Held By</p>
										<h4>{formatDisplayName(ownerUser)}</h4>
									</div>
								</a>
							</div>
						)}
							</div>) : null}
					</div>
				</div>
				<div className="coinprofile-title">
					<div className="row">
						<div className="col-sm coinprofile-stat-container">
							<div className="coinprofile-stat">
								<p>Market price</p>
								<h2>{coinPrice && round(coinPrice, 2)} CƘr</h2>
							</div>
							<div className="coinprofile-stat coinprofile-stat-actionable" onClick={this.viewCirculation.bind(this)}>
								<p>Circulation</p>
								<h2>
									<i className="fas fa-redo"></i>
								&nbsp;{coin.circulation || 1}</h2>
							</div>
							{!!isOwner && !!requests.length && (
								<div className="coinprofile-stat coinprofile-stat-actionable" onClick={this.viewRequests.bind(this)}>
									<p>Requests</p>
									<h2>{requests.length || 0}</h2>
								</div>
							)}
						</div>
						<div className="col-auto coinprofile-actions">
							<p className="coinprofile-share" onClick={this.onShare.bind(this)}>
								<i className="fas fa-share-alt"></i>
							</p>
							<p className="coinprofile-like" onClick={this.likeOrUnlike.bind(this)}>
								<i className={"fas fa-heart" + (liking ? ' animate-pulse' : '') + (coin.liked ? ' liked' : '')}></i>
							&nbsp;{coin.likes || ''}
							</p>
						{!isLoading && (
							<div className="coinprofile-action-container">
								{!!isOwner && !coin.auction && !coin.sale && !!coin.held && (
									<button className="btn btn-outline-secondary btn-sm disabled">Given</button>
								)}
								{!!isOwner && (coin.auction || coin.sale) && (
									<button className="btn btn-outline-secondary btn-sm coin-item-bid" onClick={this.cancelMarketplace.bind(this)}>Cancel {coin.sale ? 'Sale' : coin.auction ? 'Auction' : '' }</button>
								)}
								{!isOwner && !coin.auction && !coin.sale && (
									<button className={"btn btn-primary btn-sm" + (requestStatus === 'Requested' ? " disabled" : '')} onClick={this.requestCoin.bind(this)}>{requestStatus}</button>
								)}
								{!isOwner && coin.auction && market && (
									<div>
										<div className="coinprofile-title-auctionTime">
											{market.end && (
												<span className="coin-item-auctionTime">
													<i className="fas fa-clock-o"></i> {timeDifference(market.end)}</span>
											)}
										</div>
										<button className="btn btn-primary btn-sm">BUY</button>
									</div>
								)}
								{!isOwner && coin.sale && market && (
									<div>
										<button className="btn btn-primary btn-sm">BUY</button>
									</div>
								)}
							</div>
						)}
						</div>
					</div>
				</div>
				<div className="coinprofile-body container">
					<div className="row">
						<div className="col-sm-8">
							<CoinCommentsSettings {...this.props} route={this.route} coin={coin} isOwner={isOwner}/>
						</div>
						<div className="col-sm-4">
						{!loggedInUser.id && (
							<div className="not-logged-in-panel text-center">
								<h4>New to Coin.Kred?</h4>
								<p> Log in or Sign up to start creating your own custom Coins! Collect them, sell them or share with fans and friends.</p>
								<button className="btn btn-primary btn-sm" data-toggle="modal" data-target=".signup-modal">Log in or Sign up</button>
							</div>
						)}
							{coin && <CoinProfileMeta coin={coin} isOwner={isOwner} isCreator={isCreator}/>}
							{coin && <CoinValue coin={coin}/>}

							{!!tagCounts.length && (
								<div className="coinprofile-tags">
									<h4>Tags</h4>
									{tagCounts.map((tag) => (
										<p className="coinprofile-tag">
											<a to={'/marketplace/all/tag/' + tag.tag.replace(/^(audience|topic):/, '')}>
												<strong>{tag.tag.replace(/^(audience|topic):/, '')}</strong>
											&nbsp;-&nbsp;{tag.count} Coin{tag.count > 1 ? 's' : ''} share this tag</a>
										</p>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		)
	}
});

CoinProfile.propTypes = {
	history: PropTypes.shape({
		push: PropTypes.func.isRequired
	})
};

export default withRouter(CoinProfile);
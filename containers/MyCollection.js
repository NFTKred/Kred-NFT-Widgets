import React, { Component } from 'react';
import _ from 'underscore';
import async from 'async';
import '../css/myCollection'
import CreatableSelect from 'react-select/lib/Creatable';

import { history } from '../js/history';
import {isUserLoggedIn, getUser, getUserID} from '../js/auth';
import { round, checkIfMobile} from '../js/helpers';
import {getWalletsWithoutCheckingLimits, requireCanHoldTokens, getWalletCoins, getUserCoins,
	getBalance, topUserTags} from '../js/grab';
import {getDomainOwner} from '../js/sos';

import Coins from './Coins';
import { Spinner } from './Spinner';
import { CollectionTemplate } from './CollectionTemplate';
import { CollectionStats } from './CollectionStats';


class MyCollection extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: true,
			firstRendered: false,
			isSearching: !!props.searchTerm || false,
			user: {},
			page: 1,
			search: props.searchTerm || '',
			showSort: false,
			showSearch: true,
			sortBy: '',
			wallet: '',
			isOwner: false,
			myCoins: [],
			myHiddenCoins: [],
			myCoinsLoaded: false,
			myCoinAmount: 0,
			myCoinCount: 0,
			settingsAutoShow: true,
			topTags: []
		};
	}
	componentDidMount() {
		window.loggedInButNoCoins = false;

		this.renderCoins();

		window.addEventListener('scroll', e => this.onScroll());

		$(document.body).on('coinAction:done', (event) => {
			this.setState({
				page: 1,
				myCoinsLoaded: false,
				isLoading: true,
				myCoins: [],
				myHiddenCoins: []
			});
			this.renderCoins();
		});
	}
	onScroll() {
		var _this = this;

		if ($(window).scrollTop() + $(window).height() >= ($(document).height() - 700) && !_this.state.myCoinsLoaded) {
			if (_this.state.isLoading) {
				return;
			}
			_this.setState({
				page: _this.state.page + 1
			});

			async.auto({
				'walletCoins': function (next) {
					return _this.getCoins(false, next);
				},
				'hiddenCoins': function (next) {
					if (!_this.state.isOwner) {
						return next();
					}
					return _this.getCoins(true, next);
				}
			}, function (error, res) {
				_this.setState({
					isLoading: false
				});

				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}

				var coins = _.uniq(_this.state.myCoins.concat(res.walletCoins), function (coin) {
						return coin && (coin.coin || coin.draft || coin.kitty);
					}), hiddenCoins = _.uniq(_this.state.myHiddenCoins.concat(res.hiddenCoins), function (coin) {
						return coin && (coin.coin || coin.draft || coin.kitty);
					}), myCoins = _this.state.isOwner ? _.filter(coins, function (coin) {
						return !!coin.show;
					}) : coins,
					myHiddenCoins = _this.state.isOwner ? _.filter(hiddenCoins, function (coin) {
						return !coin.show;
					}) : [];

				_this.setState({
					myCoinsLoaded: res.walletCoins.length < (checkIfMobile() ? 5 : 20),
					myCoins,
					myHiddenCoins
				});

				var newGiftedCoin = _.filter(_this.state.myCoins, function (coin) {
					var now = new Date(coin.history.user),
						utc_timestamp = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),
							now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()),
						diffMs = (utc_timestamp - new Date().getTime());
					return coin.history && coin.history.action === 'send' && diffMs < 86400000;
				});

				if (newGiftedCoin) {
					setTimeout(function () {
						_.each(newGiftedCoin, function (coin) {
							$('.coin-item[data-coin-id="' + coin.coin + '"]').find('.coin-item-img').addClass('animated bounceInDown');
						});
					}, 1000);
				}
			});
		}
	}
	getCoins(getHidden, callback) {
		const { isOwner, search, wallet, page, userId, sortBy } = this.state;
		const { sort, tags } = this.props;

		const sorted = sort || sortBy || '-updated';

		const filter = {
			batched: true,
			minted: true,
			nsfw: true,
			flagged: true,
			showcase: 'sort'
		};

		if (isOwner && getHidden) {
			filter.hidden = 'only';
		}

		if (tagTerm) {
			filter.tag = tags;
		}

		if (search) {
			filter.search = search;
		}

		if (userId) {
			return getUserCoins(userId, sorted, page, filter, callback);
		} else {
			return callback(null, []);
		}
	}
	renderCoins() {
		var _this = this;

		async.auto({
			'getUser': [function (next) {
				getDomainOwner().then(owner => {
					next(null, owner);
				}, error => next(error));
			}],
			'walletCoins': ['getUser', function (res, next) {
				_this.setState({
					user: res.getUser,
					userId: res.getUser && res.getUser.id
				});

				return _this.getCoins(false, next);
			}],
			'topTag': ['getUser', function (res, next) {
				topUserTags(res.getUser && res.getUser.id, (error, topTags) => {
					if (error) {
						return next(error);
					}

					_this.setState({
						topTags,
						topTag: topTags && topTags.length ? topTags[0].tag : ''
					});

					return next();
				});
			}],
			'firstRender': ['getUser', 'walletCoins', function (res, next) {
				_this.setState({
					myCoins: res.walletCoins,
					isLoading: false,
					firstRendered: true,
					isSearching: false
				});
				return next();
			}],
			'wallets': ['getUser', function (res, next) {
				getWalletsWithoutCheckingLimits(res.getUser && res.getUser.id, next);
			}],
			'isOwner': ['wallets', 'walletCoins', function (res, next) {
				const wallet = _.first(res.wallets);
				const isOwner = getUserID() === (_this.props.userView || (wallet && wallet.user));

				if (!wallet) {
					//return next('User has no wallet');
					return next();
				}

				_this.setState({
					isOwner: isOwner,
					wallet: wallet
				});

				return next(null, isOwner);
			}],
			'hiddenCoins': ['isOwner', 'wallets', function (res, next) {
				if (!res.isOwner) {
					return next();
				}
				return _this.getCoins(true, next);
			}],
			'balance': ['wallets', function (res, next) {
				const wallet = _.first(res.wallets);

				if (!wallet) {
					return next();
				}
				return getBalance(wallet.wallet, next);
			}],
			'requireCanHoldTokens': requireCanHoldTokens
		}, function (error, res) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			var myCoins = res.isOwner ? _.filter(res.walletCoins, function (coin) {
					return !!coin.show;
				}) : res.walletCoins,
				myHiddenCoins = res.isOwner ? _.filter(res.hiddenCoins, function (coin) {
					return !coin.show;
				}) : [];

			_this.setState({
				user: res.getUser,
				myCoins,
				myHiddenCoins,
				myCoinAmount: round(res.balance && res.balance.minted_amount, 2),
				myCoinCount: round(res.balance && res.balance.minted_coins, 2),
				myBalance: round(res.balance && res.balance.unminted_amount, 2)
			});

			var hasNewCoin = localStorage.getItem('newCoin'),
				newGiftedCoin = _.filter(_this.state.myCoins, function (coin) {
					var now = new Date(coin.history.user),
						utc_timestamp = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),
							now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()),
						diffMs = (utc_timestamp - new Date().getTime());
					return coin.history && coin.history.action === 'send' && diffMs < 86400000;
				});

			if (hasNewCoin) {
				setTimeout(function () {
					$('.coin-item[data-coin-id="' + parseInt(hasNewCoin) + '"]').find('.coin-item-img').addClass('animated bounceInDown');
				}, 1000);
				localStorage.removeItem('newCoin');
			}

			if (newGiftedCoin) {
				setTimeout(function () {
					_.each(newGiftedCoin, function (coin) {
						$('.coin-item[data-coin-id="' + coin.coin + '"]').find('.coin-item-img').addClass('animated bounceInDown');
					});
				}, 1000);
			}
		});
	}
	showSort() {
		this.setState({
			showSort: !this.state.showSort
		});
	}
	showSearch() {
		this.setState({
			showSearch: !this.state.showSearch,
			showSort: false
		});
	}
	changeSort(event) {
		event.preventDefault();

		const value = $(event.target).val();

		if (value === 'previouslyheld') {
			return history.push('/collection/given');
		//} else {
		//	history.push(`/collection/sort/${encodeURIComponent(value)}`)
		}

		this.setState({
			isLoading: true,
			sortBy: value
		});
		this.renderCoins();
	}
	handleSearch(term) {
		// history.push(`/collection/search/${encodeURIComponent(term)}`)
		this.setState({
			search: term || ''
		});
		this.renderCoins();
	}
	renderFilter() {
		const { tagTerm, categoryTerm, showSearchBar, showSortToggle } = this.props;

		const {
			isSearching,
			showSort,
			showSearch,
			topTags,
			search,
		} = this.state;

		const isMobile = checkIfMobile();

		return (
			<div className="form-row justify-content-end">
				{!!showSearchBar &&!tagTerm ? (
					<i className={"fas fa-search" + (showSearch ? ' selected' : '')}></i>
				) : null}
			{!!showSearchBar ? (
				(!tagTerm && !!showSearch) && (
				<div className={"form-group "
			+ (!!showSearch ? 'col' : (isMobile ? 'col-auto text-center' : 'col-2 text-right'))}>
				{!!showSearch &&
				<input type="search" placeholder="Search" class="form-control"/>}
				</div>
				)
			) : null}


				{!!showSort && (
					<div className={"form-group " +
						(isMobile ? (!showSearch ? 'col-auto' : 'col-auto text-center') : 'col-auto')}>
						<select className="mycollection-sort form-control form-control-sm" onChange={e => this.changeSort(e)}>
							<option value='-updated'>Most Recent</option>
							<option value='+updated'>Least Recent</option>
							<option value="-value">Highest Value</option>
							<option value="+value">Lowest Value</option>
							<option value="-circulation">Most Circulated</option>
							<option value="+circulation">Least Circulated</option>
							<option value="-likes">Most Liked</option>
							<option value="+likes">Least Liked</option>
							// <option value="previouslyheld">Previously Held</option>
						</select>
					</div>
				)}
				{!!showSortToggle ? (
					<div className="col-auto">
						<i className={"fas fa-sort-amount-down" + (showSort ? ' selected' : '')} onClick={() => this.showSort()}></i>
					</div>
				) : null}

			</div>
		)
	}
	render() {
		const {tagTerm, showCollectionStats} = this.props;
		const {
			isLoading,
			firstRendered,
			isSearching,
			user,
			search,
			isOwner,
			myCoins,
			myHiddenCoins,
			myCoinAmount,
			myCoinCount,
			myBalance,
		} = this.state;

		const isLoggedIn = isUserLoggedIn();

		window.loggedInButNoCoins = isLoggedIn && !myCoins.length;

		if (!firstRendered || isLoading) {
			return <Spinner />;
		}

		return (
			<CollectionTemplate
				backButton={false}
				filter={
					<div>
						{this.renderFilter()}

						{(!!showCollectionStats && !isLoading && !search && myCoinCount && myCoinAmount && myBalance) ? (
							<CollectionStats
								first={`${myCoinCount} Coins`}
								firstTitle={`Estimated Value: ${myCoinAmount} CƘr`}
								second={`${myBalance} CƘr`}
								secondTitle={`My Balance: ${myBalance} CƘr`}
							/>
						) : null}
					</div>
				}
			>
				{tagTerm ? (
					<div style={{ padding: '10px 10px 0' }}>
						<p>
							<strong>Share this Search:</strong> {'https://app.coin.kred/collection/tag/' + encodeURIComponent(tagTerm)}</p>
					</div>
				) : null}
				{!isSearching && search && search.length && (
					<div style={{ padding: '10px 10px 0' }}>
						<p>
							<strong>Share this Search:</strong> {'https://app.coin.kred/collection/search/' + encodeURIComponent(search)}</p>
					</div>
				)}
				{isSearching ? <Spinner /> :
					myCoins && myCoins.length ? (
						<div>
							{isLoading ? <Spinner /> : null}
							<Coins {...this.props} coins={myCoins} batched={true} />
						</div>)
						:
						search.length ? (<p>"No results for {search}"</p>) : null
				}
			</CollectionTemplate>
		)
	}
}

export default MyCollection;

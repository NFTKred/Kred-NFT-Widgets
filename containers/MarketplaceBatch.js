import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import async from 'async';
import _ from 'underscore';

import MarketplaceTabs from './Marketplace/Tabs';
import Coins from './Coins';

import {getMarket, search} from '../js/grab';
import {checkIfMobile} from '../js/helpers';
import { BackButton } from './BackButton';

var typewatch = function () {
	var timer = 0;
	return function (callback, ms) {
		clearTimeout(timer);
		timer = setTimeout(callback, ms);
	}
}(), isLoading = false;

const MarketplaceBatch = React.createClass({
	getInitialState() {
		return {
			isLoading: true,
			isSearching: false,
			userId: '',
			isOwner: false,
			tab: 'all-tab',
			allCoins: [],
			allCoinsLoaded: false,
			allPage: 1,
			allSort: this.props.batchNumber ? '-coin' : '-created',
			saleCoinsLoaded: false,
			saleCoins: [],
			salePage: 1,
			saleSort: this.props.batchNumber ? '-coin' : '-created',
			batched: {},
			topTags: [],
			isMobile: checkIfMobile(),
			onScroll: this.onScroll.bind(this),
			toggleSetting: false
		};
	},
	getCoins(callback) {
		var _this = this;

		if (_this.state.tab === 'all-tab') {
			return search({
				//user: _this.props.batchNumber ? '' : _this.state.userId,
				page: _this.state.allPage,
				sort: _this.state.allSort,
				status: 'active',
				search: _this.state.search,
				batched: !_this.props.batchNumber,
				batch: _this.props.batchNumber,
				tag: _this.props.tagTerm,
				domain: _this.props.tagTerm && _this.props.domain ? _this.props.domain : '',
				showcase: 'sort'
			}, callback);
		} else if (_this.state.tab === 'sales-tab') {
			return getMarket({
				//user: _this.props.batchNumber ? '' : _this.state.userId,
				page: _this.state.salePage,
				sort: _this.state.saleSort,
				status: 'active',
				search: _this.state.search,
				batched: !_this.props.batchNumber,
				batch: _this.props.batchNumber,
				tag: _this.props.tagTerm,
				domain: _this.props.tagTerm && _this.props.domain ? _this.props.domain : '',
				showcase: 'sort'
			}, callback);
		}
	},
	componentWillUnmount() {
		window.removeEventListener('scroll', this.onScroll, false);
	},
	componentDidMount: function () {
		var _this = this;

		$(document.body).on('coinAction:done', function () {
			_this.renderCoins();
		});

		window.addEventListener('scroll', _this.onScroll, false);
		window.addEventListener('resize', _this.resize);

		if (location.pathname.match(/marketplace$/) || location.pathname.match(/marketplace\/batch/)) {
			$('#marketplaceTabsContent').find('.tab-pane').removeClass('show active');
			$('#marketplaceTabsContent').find('.tab-pane#sales').addClass('show active');
			$('#marketplaceTabs').find('.nav-item').removeClass('active show');
			$('#marketplaceTabs').find('.nav-item[href="#sales"]').addClass('active show');
			_this.setState({
				tab: 'sales-tab' //selected tab
			});
		} else if (location.pathname.match('/') || location.pathname.match(/marketplace\/all/)) {
			$('#marketplaceTabsContent').find('.tab-pane').removeClass('show active');
			$('#marketplaceTabsContent').find('.tab-pane#all').addClass('show active');
			$('#marketplaceTabs').find('.nav-item').removeClass('active show');
			$('#marketplaceTabs').find('.nav-item[href="#all"]').addClass('active show');
			_this.setState({
				tab: 'all-tab' //selected tab
			});
		}
	},
	componentWillMount() {
		this.renderCoins();
	},
	componentDidUpdate() {
		var _this = this;

		$('.marketplace-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			_this.setState({
				tab: $(e.target).attr('id') //selected tab
			});
		});
	},
	resize() {
		this.setState({
			isMobile: checkIfMobile()
		});
	},
	onScroll(event) {
		var _this = this;

		if ($(window).scrollTop() + $(window).height() >= ($(document).height() - 450)) {
			if (isLoading) {
				return;
			}
			isLoading = true;
			if (_this.state.tab === 'all-tab') {
				if (_this.state.allCoinsLoaded) {
					isLoading = false;
					return;
				}
				_this.setState({
					allPage: _this.state.allPage + 1,
					allSort: _this.state.allSort
				});
			} else if (_this.state.tab === 'sales-tab') {
				if (_this.state.saleCoinsLoaded) {
					isLoading = false;
					return;
				}
				_this.setState({
					salePage: _this.state.salePage + 1,
					saleSort: _this.state.saleSort
				});
			}

			return _this.getCoins(function (error, coins) {
				if (error) {
					isLoading = false;
					return $(document.body).trigger('messenger:show', ['error', error]);
				}

				if (_this.state.tab === 'all-tab') {
					_this.setState({
						allCoinsLoaded: coins.length < (_this.state.isMobile ? 5 : 20),
						allCoins: _this.state.allCoins.concat(coins)
					});
				} else if (_this.state.tab === 'sales-tab') {
					_this.setState({
						saleCoinsLoaded: coins.length < (_this.state.isMobile ? 5 : 20),
						saleCoins: _this.state.saleCoins.concat(coins)
					});
				}
				isLoading = false;
			});
		}
	},
	changeFilter: function (e) {
		var _this = this,
			val = $(e.target).val();

		_this.setState({
			tab: val //selected tab
		});

		if (!_this.props.batchNumber) {
			_this.props.history.push(val === 'sales-tab' ? '/marketplace' : '/marketplace/all')
		}
	},
	changeSort(event) {
		event.preventDefault();
		var _this = this,
			value = $(event.target).val();

		if (_this.state.tab === 'all-tab') {
			_this.setState({
				allPage: 1,
				allSort: value
			});
		} else if (_this.state.tab === 'sales-tab') {
			_this.setState({
				salePage: 1,
				saleSort: value
			});
		}

		return _this.getCoins(function (error, coins) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			if (_this.state.tab === 'all-tab') {
				_this.setState({
					allCoinsLoaded: coins.length < (_this.state.isMobile ? 5 : 20),
					allCoins: coins
				});
			} else if (_this.state.tab === 'sales-tab') {
				_this.setState({
					saleCoinsLoaded: coins.length < (_this.state.isMobile ? 5 : 20),
					saleCoins: coins
				});
			}
		});
	},
	renderCoins() {
		var _this = this;

		async.auto({
			getAllCoins: function (next) {
				return search({
					//user: _this.props.batchNumber ? '' : _this.state.userId,
					status: 'active',
					search: _this.state.search,
					sort: _this.state.allSort,
					batched: !_this.props.batchNumber,
					batch: _this.props.batchNumber,
					tag: _this.props.tagTerm,
					domain: _this.props.tagTerm && _this.props.domain ? _this.props.domain : '',
					showcase: 'sort'
				}, next);
			},
			getSaleCoins: function (next) {
				return getMarket({
					//user: _this.props.batchNumber ? '' : _this.state.userId,
					status: 'active',
					search: _this.state.search,
					sort: _this.state.allSort,
					batched: !_this.props.batchNumber,
					batch: _this.props.batchNumber,
					tag: _this.props.tagTerm,
					domain: _this.props.tagTerm && _this.props.domain ? _this.props.domain : '',
					showcase: 'sort'
				}, next);
			},
			getMarketBatched: function (next) {
				return getMarket({
					status: 'active',
					batched: true,
					batch: _this.props.batchNumber
				}, next);
			}
		}, function (error, results) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			_this.setState({
				allCoins: results.getAllCoins || [],
				saleCoins: results.getSaleCoins || [],
				batched: results.getMarketBatched[0] || {},
				isLoading: false,
				isSearching: false
			});
		});
	},
	toggleSetting(event) {
		this.setState({
			toggleSetting: !this.state.toggleSetting
		});
	},
	render: function () {
		const {
			global,
			loggedInUser,
			batchNumber,
			history
			} = this.props;
		const {
			isLoading,
			tagTerm,
			allCoins,
			saleCoins,
			batched,
			tab,
			tags,
			isMobile,
			toggleSetting
			} = this.state;

		return (
			<div className="marketplace-container">
				<div>
					<MarketplaceTabs {...this.props} tags={tags} search=""
						onSearch="" changeSort={(e) => this.changeSort(e)} changeFilter={(e) => this.changeFilter(e)}/>
				</div>

				<div className="tab-content" id="marketplaceTabsContent">
					<BackButton />

					<div style={{padding: '10px 10px 0'}}>
						<h2 className="marketplace-title">{allCoins.length > 0 ? allCoins[0].name : ''}
						{allCoins.length > 0 && loggedInUser.id === allCoins[0].user ? (<i className="fas fa-cog" style={{
							cursor: 'pointer',
							marginLeft: '10px'
						}} onClick={() => this.toggleSetting()}></i>) : null}
						</h2>
					{!isLoading ? (<p>Batch of {!_.isEmpty(batched) && tab === 'sales-tab' ? (batched && batched.coin && batched.coin.coins) : (allCoins && allCoins[0] && allCoins[0].count)} Coins</p>) : null}
					</div>

					<div className="tab-pane fade" id="sales" role="tabpanel" aria-labelledby="sales-tab">
						{saleCoins.length ? (<Coins coins={saleCoins} loggedInUser={loggedInUser} path="marketplace" batched={false} viewBatch=""/>) : (
							<p style={{padding: '5px'}}>{!isLoading && ("No Coins found!")}</p>)
							}
					</div>
					<div className="tab-pane fade show active" id="all" role="tabpanel" aria-labelledby="all-tab">
						{allCoins.length ? (
							<Coins coins={allCoins}
								loggedInUser={loggedInUser}
								path="marketplace"
								batched={false}
								viewBatch=""/>
						) : (<p style={{
							padding: '5px'
						}}>{!isLoading && ("No Coins found!")}</p>)
							}
					</div>
				</div>
			</div>
		)
	}
});

MarketplaceBatch.propTypes = {
	history: PropTypes.shape({
		push: PropTypes.func.isRequired
	})
};

export default withRouter(MarketplaceBatch);
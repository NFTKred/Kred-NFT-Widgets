import React from 'react';
import {Link} from 'react-router-dom';
import async from 'async';
import Coin from './Coin';
import _ from 'underscore';
import '../css/leaderboard'

import {getLeaders} from '../js/grab';
import {checkIfMobile} from '../js/helpers';
import { getDomainOwner } from '../js/sos';

var isMyLoading = false,
	isAllLoading = false;

const Leaderboard = React.createClass({
	getInitialState() {
		return {
			isRendering: true,
			error: false,
			allLeadersPage: 1,
			allLeaders: [],
			allLeadersLoaded: false,
			allLeadersError: false,
			myLeadersPage: 1,
			myLeaders: [],
			myLeadersLoaded: false,
			myLeadersError: false
		};
	},
	componentDidMount: function () {
		var _this = this;
		_this.getAllLeaders();
		_this.getMyLeaders();


	},
	componentDidUpdate: function () {
		var _this = this;
		$('.mycoins-items').on('scroll', function () {
			if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 200 && !_this.state.myLeadersLoaded) {
				if (isMyLoading) {
					return;
				}
				_this.setState({
					page: _this.state.myLeadersPage + 1
				});
				_this.getMyLeaders();
			}
		});
		$('.allcoins-items').on('scroll', function () {
			if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 200 && !_this.state.allLeadersLoaded) {
				if (isAllLoading) {
					return;
				}
				_this.setState({
					page: _this.state.allLeadersPage + 1
				});
				_this.getAllLeaders();
			}
		});
	},
	getAllLeaders() {
		var _this = this;

		return _this.getLeaders('', function (error, coins) {
			if (error) {
				return _this.setState({error: error});
			}
			_this.setState({
				allLeaders: _.filter(_this.state.allLeaders.concat(coins), function (coin) {
					return coin && coin.batch;
				}),
				allLeadersLoaded: coins.length < 20,
				isRendering: false
			});
			isAllLoading = false;
		});
	},
	getMyLeaders() {
		var _this = this;
		return _this.getLeaders('collection', function (error, coins) {
			if (error) {
				return _this.setState({error: error});
			}

			_this.setState({
				myLeaders: _.filter(_this.state.myLeaders.concat(coins), function (coin) {
					return coin && coin.batch;
				}),
				myLeadersLoaded: coins.length < 20,
				isRendering: false
			});
			isMyLoading = false;
		});
	},
	async getLeaders(mode, callback) {
		var _this = this,
			domainUser = await getDomainOwner();

		return getLeaders({
			page: _this.state.allLeadersPage,
			mode: mode,
			tags: '',
			sort: 'batch_circulation',
			batched: true,
			user: domainUser.id
		}, callback);
	},
	render: function () {
		const {
			loggedInUser
			} = this.props;
		const { isRendering, allLeaders, allLeadersError, myLeaders, myLeadersError } = this.state;

		if (isRendering) {
			return <div class="text-center" style={{margin: '10vh 0'}}>
				<i className="fas fa-2x fa-spin fa-spinner"></i>
			</div>;
		}

		if (!myLeaders.length) {
			$('.leaders-tab a[href="#allcoins"]').tab('show');
		} else {
			$('.leaders-tab a[href="#mycoins"]').tab('show');
		}

		return (
			<div className="leaders-container">
				<ul class="nav nav-tabs nav-justified leaders-tab" id="leadersTabs" role="tablist">
					{!!myLeaders.length && (
						<li class="nav-item">
							<a class="nav-link active" id="mycoins-tab" data-toggle="tab" href="#mycoins" role="tab" aria-controls="mycoins" aria-selected="true">My Most Circulated</a>
						</li>
					)}
					<li class="nav-item">
						<a class="nav-link" id="allcoins-tab" data-toggle="tab" href="#allcoins" role="tab" aria-controls="allcoins" aria-selected="false">Most Circulated</a>
					</li>
				</ul>
				<div class="tab-content">
					<div class="tab-pane fade show active" id="mycoins" role="tabpanel" aria-labelledby="mycoins-tab">
						<div className="mycoins-items">
						{myLeadersError && (
							<p className="text-danger">{myLeadersError}</p>
						)}
						{myLeaders.map((coin, index) => {
								return (
									<div className="leader-item row no-gutters" key={coin.id}>
										<div className="col-1">
											<p>
												<strong>{index + 1}</strong>
											</p>
										</div>
										<div className="col-2">
											<a href={"/coin/" + coin.symbol + '/' + coin.sequence}>
												<Coin
													id={coin.coin}
													width="50"
													image={coin.face}
													upperText={coin.name}
													lowerText={coin.value + 'CƘr - \uf0c0 ' + (coin.circulation || 1)}
													backgroundColor={coin.color}
													textColor={coin.text_color}
													pattern={coin.pattern}
													patternColor={coin.pattern_color}
												/>
											</a>
										</div>
										<div className="col-7">
											<a href={"/coin/" + coin.symbol + '/' + coin.sequence}>
												<p>{coin.name}</p>
												<p>{coin.coins + ' Coins by ' + (coin.creator && coin.creator.name)}</p>
											</a>
										</div>
										<div className="col-2 text-right">
											<p>
												<span>{'\uf0c0 '}</span>{(coin.batch_circulation || 1)}</p>
										</div>
									</div>
								)
							}
						)}
						</div>
					</div>
					<div class="tab-pane fade" id="allcoins" role="tabpanel" aria-labelledby="allcoins-tab">
						<div className="allcoins-items">
						{allLeadersError && (
							<p className="text-danger">{allLeadersError}</p>
						)}
						{allLeaders.map((coin, index) => {
								return (
									<div className="leader-item row no-gutters" key={coin.id}>
										<div className="col-1">
											<p>
												<strong>{index + 1}</strong>
											</p>
										</div>
										<div className="col-2">
											<a href={"/coin/" + coin.symbol + '/' + coin.sequence}>
												<Coin
													id={coin.coin}
													width="50"
													image={coin.face}
													upperText={coin.name}
													lowerText={coin.value + 'CƘr - \uf0c0 ' + (coin.circulation || 1)}
													backgroundColor={coin.color}
													textColor={coin.text_color}
													pattern={coin.pattern}
													patternColor={coin.pattern_color}
												/>
											</a>
										</div>
										<div className="col-7">
											<a href={"/coin/" + coin.symbol + '/' + coin.sequence}>
												<p>{coin.name}</p>
												<p>{coin.coins + ' Coin' + (coin.coins > 1 ? 's' : '') + ' by ' + (coin.creator && coin.creator.name)}</p>
											</a>
										</div>
										<div className="col-2 text-right">
											<p>
												<span>{'\uf0c0 '}</span>{(coin.batch_circulation || 1)}</p>
										</div>
									</div>
								)
							}
						)}
						</div>
					</div>
				</div>
			</div>
		)
	}
});

export default Leaderboard;
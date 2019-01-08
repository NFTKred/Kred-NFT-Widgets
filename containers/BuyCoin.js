import React, { Component } from 'react';
import async from 'async';
import _ from 'underscore';
import CoinFrontBack from './CoinFrontBack';

import '../css/buyCoin.css'

import {buyCoin, getMarket, getWallet, getWallets, gas, getBalance} from '../js/grab'
import {round} from '../js/helpers';
import { getUserID, getUser } from '../js/auth';
import KYCCheck from './KYCCheck';

class BuyCoin extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			wallets: [],
			coinWallet: {},
			balance: 0,
			ethWallet: {},
			wallet: {},
			market: {},
			gas: 0,
			buyWithEthereum: false
		};
	}
	componentDidMount() {
		var _this = this,
			coin = _this.props.coin,
			wallets = [];

		return async.auto({
			'coinWallet': function (next) {
				return getWallet(coin.wallet, next);
			},
			'wallets': function (next) {
				return getWallets(getUserID(), next);
			},
			'balance': ['wallets', function (res, next) {
				wallets = res.wallets;

				if (!wallets) {
					return next('You have no wallet!');
				}

				return getBalance(_.find(wallets, function (wallet) {
					return wallet.platform === 'stellar';
				}).wallet, next);
			}],
			'market': function (next) {
				if (!!coin && !coin.sale && !coin.auction) {
					return next();
				}
				return getMarket({coin: coin.coin, status: 'active'}, next);
			}
		}, function (error, res) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			_this.setState({
				loading: false,
				wallets: wallets,
				coinWallet: res.coinWallet,
				balance: res.balance && res.balance.unminted_amount,
				ethWallet: _.find(wallets, function (wallet) {
					return wallet.platform === 'ethereum';
				}),
				wallet: _.find(wallets, function (wallet) {
					return wallet.platform === 'stellar';
				}),
				market: res.market && res.market[0]
			})
		});
	}
	toggleWallet(event) {
		var _this = this,
			isEthereum = $(event.target).is(':checked'),
			wallets = _this.state.wallets;

		//All transactions besides stellar > stellar will incur a gas fee
		if (_this.state.coinWallet.platform === 'stellar' && !isEthereum) {
			//Stellar > Stellar
			return getBalance(_.find(wallets, function (wallet) {
				return wallet.platform === 'stellar';
			}).wallet, function (error, balance) {
				_this.setState({
					balance: balance && balance.unminted_amount,
					gas: 0,
					buyWithEthereum: false
				});
			});
		}

		gas((isEthereum ? 'ethereum' : 'stellar'), function (error, gas) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			if (isEthereum) {
				//Stellar > Ethereum
				return getBalance(_.find(wallets, function (wallet) {
					return wallet.platform === 'ethereum';
				}).wallet, function (error, balance) {
					_this.setState({
						balance: balance && balance.unminted_amount,
						gas: gas.price,
						buyWithEthereum: true
					});
				});
			} else {
				//Ethereum > Stellar
				return getBalance(_.find(wallets, function (wallet) {
					return wallet.platform === 'stellar';
				}).wallet, function (error, balance) {
					_this.setState({
						balance: balance && balance.unminted_amount,
						gas: gas.price,
						buyWithEthereum: false
					});
				});
			}
		});
	}
	buyCoin() {
		//BUY COIN
		var _this = this,
			coin = _this.props.coin;
		const {
			payPremiumFee,
			domainMarketplaceShop
			} = this.props;
		const {
			ethWallet,
			wallet,
			market,
			buyWithEthereum,
			} = this.state;

		$(document.body).trigger('messenger:show', ['progress', 'Processing Stellar Blockchain..']);

		var useWallet = ethWallet && buyWithEthereum ? ethWallet : wallet,
			data = {
				sale: market && market.sale,
				auction: market && market.auction
			};

		if (payPremiumFee) {
			data.market = domainMarketplaceShop;
		}

		return buyCoin(data, useWallet.wallet, function (error, res) {
			$(document.body).trigger('messenger:progressStop');
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$('#nav-tab a[href="#nav-bought"]').tab('show');
			$(document.body).trigger('coinAction:done');
			$(document.body).trigger('balanceUpdate:init');
		});
	}
	render() {
		const {
			coin,
			payPremiumFee
			} = this.props;

		const {
			loading,
			coinWallet,
			ethWallet,
			wallet,
			balance,
			market,
			gas
			} = this.state;


		const price = !!market ? market.price : coin.value,
			premiumFee = payPremiumFee ? price * 0.01 : 0,
			total = price + (price * 0.03) + premiumFee + gas,
			royalties = market && market.royalties;

		return (
			<div className="buycoin-modal modal fade" tabindex="-1" role="dialog" aria-hidden="true">
				<div className="vertical-alignment-helper">
					<div className="modal-dialog modal-md vertical-align-center">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Buy a Coin</h5>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<nav>
								<div className="nav nav-tabs" id="nav-tab" role="tablist">
									<a className="nav-item hidden" id="nav-buyvalidate-tab" data-toggle="tab" href="#nav-buyvalidate" role="tab" aria-controls="nav-buyvalidate" aria-selected="false"></a>
									<a className="nav-item hidden active" id="nav-buy-tab" data-toggle="tab" href="#nav-buy" role="tab" aria-controls="nav-buy" aria-selected="false"></a>
									<a className="nav-item hidden" id="nav-bought-tab" data-toggle="tab" href="#nav-bought" role="tab" aria-controls="nav-bought" aria-selected="false"></a>
									<div className="tab-content" id="nav-tabContent" style={{width: '100%'}}>
										<div className="tab-pane fade" id="nav-buyvalidate" role="tabpanel" aria-labelledby="nav-buyvalidate-tab">
											<div className="modal-body">
												<KYCCheck
													user={getUser()}
													validate="buyvalidate"
													intro="buy"/>
											</div>
										</div>
										<div className="tab-pane fade show active" id="nav-buy" role="tabpanel" aria-labelledby="nav-buy-tab">
											<div className="modal-body text-center">
												<h2>Market Price: {round(price, 2)} CƘr</h2>
												<div className="modal-coin-container">
													<CoinFrontBack
														width={300}
														coin={coin}
													/>
														{coinWallet.platform === 'ethereum' || !!gas && (
															<div className="row no-gutters justify-content-sm-center">
																<div className="col-2 text-right">
																	<span className="fa fa-2x" style={{
																		'margin-right': '5px'
																	}}>⛽</span>
																</div>
																<div className="col-7 text-left">
																	<span>This coin is in an&nbsp;<strong className="text-capitalize">{coinWallet.platform}</strong>&nbsp;
																		wallet.</span>
																	<br/>
																	<span>Purchasing this Coin will incur a Gas charge.</span>
																</div>
															</div>
														)}

												</div>
												<div className="buyprice-table text-left">
													{!!ethWallet && ethWallet.wallet && (
														<div className="row">
															<div className="col-4">
																<p>Wallet</p>
															</div>
															<div className="col-8 text-right walletToggle-container">
																<span>Stellar</span>
																<label for="wallet" className="switch">
																	<input type="checkbox" id="wallet" name="wallet" onChange={(e) => this.toggleWallet(e)}/>
																	<div className="slider round"></div>
																</label>
																<span>Ethereum</span>
															</div>
														</div>
													)}

													<div className={"row" + (!!loading ? '' : (balance >= total ? ' text-success' : ' text-danger'))}>
														<div className="col">
															<p>
																<strong>Your Balance</strong>
															</p>
														</div>
														<div className="col text-right">
															<p>
																<strong>{round(balance, 2)} CƘr</strong>
															</p>
														</div>
													</div>
													<div className="row">
														<div className="col">
															<p>Sale Price</p>
														</div>
														<div className="col text-right">
															<p>{round(price, 2)} CƘr</p>
														</div>
														<div className="col-12">
														{royalties && royalties.ckr_rate_1 && royalties.ckr_domain_1 ? (
															<p><small>*{royalties.ckr_rate_1}% of this price will be paid to {royalties.ckr_domain_1} as a Royalty</small></p>
														) : null}
														{royalties && royalties.ckr_rate_2 && royalties.ckr_domain_2 ? (
															<p><small>*{royalties.ckr_rate_2}% of this price will be paid to {royalties.ckr_domain_2} as a Royalty</small></p>
														) : null}
														</div>
													</div>
													<div className="row">
														<div className="col">
															<p>3% Fee</p>
														</div>
														<div className="col text-right">
															<p>+ {round(price * 0.03, 2)} CƘr</p>
														</div>
													</div>
													{!!payPremiumFee && (
														<div className="row">
															<div className="col">
																<p>1% Finder's Fee</p>
															</div>
															<div className="col text-right">
																<p>+ {round(price * 0.01, 2)} CƘr</p>
															</div>
														</div>
													)}
													<div className={"row" + (gas ? '' : ' hide')}>
														<div className="col">
															<p>Gas</p>
														</div>
														<div className="col text-right">
															<p>+ {round(gas, 2)} CƘr</p>
														</div>
													</div>
													<div className="row">
														<div className="col">
															<p>
																<strong>You will Pay</strong>
															</p>
														</div>
														<div className="col text-right">
															<p>
																<strong>{round(total, 2)} CƘr</strong>
															</p>
														</div>
													</div>
												</div>
											</div>
											<div className="modal-footer">
												{balance >= total ? (
													<div>
														{/*<a href={"/buy?coin=" + coin.coin + '&total=' + total} className="btn btn-link">Buy with another Currency</a>*/}
														<button type="button" onClick={this.buyCoin.bind(this)} className="btn btn-primary">Buy</button>
													</div>

												) : (
													<a href={"/buy?coin=" + coin.coin + '&total=' + total} className="btn btn-primary">Top up</a>
												)}
											</div>
										</div>
										<div className="tab-pane fade" id="nav-bought" role="tabpanel" aria-labelledby="nav-bought-tab">
											<div className="modal-body text-center">
												<h3>Congratulations!</h3>
												<p>This Coin was added to your Collection</p>
												<div className="modal-coin-container">
													<CoinFrontBack
														width={300}
														coin={coin}
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							</nav>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default BuyCoin;
import React from 'react';
import _ from 'underscore';

import CoinFrontBack from './CoinFrontBack';
import '../css/coinGallery';
import {getWallets, getWalletCoins} from '../js/grab';

const CoinGallery = React.createClass({
	getInitialState() {
		return {
			coins: []
		};
	},
	componentDidMount: function () {
		//Get minted coins
		var _this = this;
		return getWallets(_this.props.userId, function (error, wallets) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			var wallet = _.first(wallets);
			console.log('Crypto Kred Check wallets', wallets);
			if (!wallet) {
				//return $(document.body).trigger('messenger:show', ['error', 'You don\'t have a wallet!']);
				return;
			}
			return getWalletCoins(wallet.wallet, '', 1, {minted: true, count: 200}, function (error, coins) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}

				_this.setState({
					coins: coins
				});
			});
		});
	},
	render: function () {
		const {
			coins,
			} = this.state;

		return (
			<div className="coingallery-container">
				<div id="coinSelectorControls" className="carousel slide" data-interval="false">
					<div className="carousel-inner">
						{coins.map((coin, index) => {
							return (
								<div className={"carousel-item" + (index === 0 ? ' active' : '')}>
									<a href={"/coin/" + coin.symbol + "/" + coin.sequence} target="_blank">
										<CoinFrontBack
											coin={coin}
											width={200}
										/>
									</a>
								</div>
							)
						})}

					</div>
					<a className="carousel-control-prev" href="#coinSelectorControls" role="button" data-slide="prev">
						<i className="fas fa-angle-left" aria-hidden="true"></i>
						<span className="sr-only">Previous</span>
					</a>
					<a className="carousel-control-next" href="#coinSelectorControls" role="button" data-slide="next">
						<i className="fas fa-angle-right" aria-hidden="true"></i>
						<span className="sr-only">Next</span>
					</a>
				</div>
			</div>
		)
	}
});

export default CoinGallery;
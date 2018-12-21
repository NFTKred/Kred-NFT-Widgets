import React, { Component } from 'react';
import _ from 'underscore';
import NumberList from './NumberList';
import CoinFrontBack from './CoinFrontBack';

import {getWallets, bidOnCoin, getAuctions} from '../js/grab'

class PlaceYourBid extends Component {
	constructor(props) {
		super(props);

		this.state = {
			yourBid: 0,
			auction: {}
		};
	}
	componentDidMount() {
		$('.coin-action-modals').on('hidden.bs.modal', function (e) {
			this.remove();
		});
	}
	componentWillMount() {
		var _this = this;
		return getAuctions({coin: _this.props.coin.coin, status: 'active'}, function (error, auctions) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			_this.setState({
				auction: _.find(auctions, function (auction) {
					return auction && auction.coin && auction.coin.coin === _this.props.coin.coin;
				})
			})
		});
	}
	makeABid(event) {
		event.preventDefault();
		//Make a bid
		var _this = this,
			$form = $(event.target),
			yourBid = $form.find('.makeABid-price').val();

		return getWallets(_this.props.loggedInUser.id, function (error, wallets) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			var wallet = _.first(wallets);
			if (!wallet) {
				return $(document.body).trigger('messenger:show', ['error', 'You have no wallet!']);
			}
			bidOnCoin(_this.state.auction.auction, _this.state.auction.price, wallet.wallet, function (error, res) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', 'Issue with Buying coin. Please try again later.']);
				}
				_this.setState({
					yourBid: yourBid
				});
				$('#nav-tab a[href="#nav-bidded"]').tab('show');
				$(document.body).trigger('coinAction:done');
			});
		});
	}
	render() {
		const {
			coin
			} = this.props;
		const {
			auction,
			yourBid
			} = this.state;

		const endTime = new Date(auction.end).toLocaleString();

		return (
			<div className="placeyourbid-modal modal fade" tabindex="-1" role="dialog" aria-hidden="true">
				<div className="vertical-alignment-helper">
					<div className="modal-dialog modal-md vertical-align-center">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Place your Bid</h5>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<nav>
								<div className="nav nav-tabs" id="nav-tab" role="tablist">
									<a className="nav-item hidden" id="nav-bidded-tab" data-toggle="tab" href="#nav-bidded" role="tab" aria-controls="nav-bidded" aria-selected="false"></a>

									<div className="tab-content" id="nav-tabContent" style={{width: '100%'}}>
										<div className="tab-pane fade show active" id="nav-bid" role="tabpanel" aria-labelledby="nav-bid-tab">
											<div className="tab-pane fade show active">
												<form className="makeABid-form" onSubmit={this.makeABid.bind(this)}>
													<div className="modal-body text-center">
														//<NumberList selectorName="makeABid-price" coinValue={coin.value || coin.price}/>
														<div className="modal-coin-container">
															<CoinFrontBack
																coin={coin}
																width={300}
															/>
														</div>
														<h4>{coin.name}</h4>
														<h4>Auction Ends: {endTime}</h4>
													</div>
													<div className="modal-footer">
														<button type="submit" className="btn btn-primary">Bid Now</button>
													</div>
												</form>
											</div>
										</div>
										<div className="tab-pane fade" id="nav-bidded" role="tabpanel" aria-labelledby="nav-bidded-tab">
											<div className="tab-pane fade show active">
												<div className="modal-body text-center">
													<h3>Bid Confirmed!</h3>
													<p>Auction Ends: {endTime}</p>
													<p>Your Bid: {yourBid} CƘr</p>
													<div className="modal-coin-container">
														<CoinFrontBack
															coin={coin}
															width={300}
														/>
													</div>
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

export default PlaceYourBid;
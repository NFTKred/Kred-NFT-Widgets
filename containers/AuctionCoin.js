import React, { Component } from 'react';
import $ from 'jquery';
import 'bootstrap';

import NumberList from './NumberList';
import CoinFrontBack from './CoinFrontBack';
import '../css/auctionCoin.css';
import { auctionCoin } from '../js/grab';
import { requireLogin } from '../js/auth';
import { openModal } from '../js/modal';

export function openAuctionCoinModal(props) {
	if (requireLogin()) {
		return;
	}

	openModal(AuctionCoin, props);
}

class AuctionCoin extends Component {
	state = {
		highPrice: this.props.coin.value || this.props.coin.price,
		lowPrice: 0,
		duration: 1,
	};

	setReservePrice(event) {
		event.preventDefault();
		//set High / Low price
		var $form = $(event.target),
			highPrice = $form.find('.auction-reserve-highPrice').val(),
			lowPrice = $form.find('.auction-reserve-lowPrice').val();

		this.setState({
			highPrice: highPrice,
			lowPrice: lowPrice,
		});

		$('#nav-tab a[href="#nav-time"]').tab('show');
	}
	confirmAuction(event) {
		event.preventDefault();

		var $form = $(event.target),
			duration = $form.find('.auction-confirm-duration').val(),
			coin = this.props.coin,
			now = new Date().getTime(),
			auctionBatch = this.props.auctionBatch;

		this.setState({
			duration: duration,
		});
		auctionCoin(
			auctionBatch ? '' : coin.coin,
			auctionBatch ? coin.batch : '',
			Math.round(now / 1000),
			Math.round((now + duration * 86400000) / 1000),
			this.state.highPrice,
			this.state.lowPrice,
			function(error, res) {
				if (error) {
					return $(document.body).trigger('messenger:show', [
						'error',
						error,
					]);
				}
				$('#nav-tab a[href="#nav-auctioned"]').tab('show');
				$(document.body).trigger('coinAction:done');
			}
		);
	}
	render() {
		const { coin } = this.props;
		const { highPrice, lowPrice, duration } = this.state;

		return (
			<div
				className="auctioncoin-modal modal fade"
				tabIndex="-1"
				role="dialog"
				aria-hidden="true"
			>
				<div className="vertical-alignment-helper">
					<div className="modal-dialog modal-md vertical-align-center">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">
									Auction this Coin
								</h5>
								<button
									type="button"
									className="close"
									data-dismiss="modal"
									aria-label="Close"
								>
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<nav>
								<div
									className="nav nav-tabs"
									id="nav-tab"
									role="tablist"
								>
									<a
										className="nav-item hidden active"
										id="nav-intro-tab"
										data-toggle="tab"
										href="#nav-intro"
										role="tab"
										aria-controls="nav-intro"
										aria-selected="true"
									/>
									<a
										className="nav-item hidden"
										id="nav-time-tab"
										data-toggle="tab"
										href="#nav-time"
										role="tab"
										aria-controls="nav-time"
										aria-selected="true"
									/>
									<a
										className="nav-item hidden"
										id="nav-auctioned-tab"
										data-toggle="tab"
										href="#nav-auctioned"
										role="tab"
										aria-controls="nav-auctioned"
										aria-selected="false"
									/>

									<div
										className="tab-content"
										id="nav-tabContent"
										style={{ width: '100%' }}
									>
										<div
											className="tab-pane fade"
											id="nav-intro"
											role="tabpanel"
											aria-labelledby="nav-intro-tab"
										>
											<div className="modal-body text-center">
												<p>
													Auction your Coin in the
													Marketplace to sell to
													whoever is willing to pay
													the highest price!
												</p>
												<img
													src="https://d30p8ypma69uhv.cloudfront.net/cryptokred-images/Auction_1.png"
													style={{ width: '350px' }}
												/>
											</div>
											<div className="modal-footer">
												<a
													className="btn btn-primary"
													id="nav-reserve-tab"
													data-toggle="tab"
													href="#nav-reserve"
													role="tab"
													aria-controls="nav-reserve"
													aria-selected="false"
												>
													Next
												</a>
											</div>
										</div>
										<div
											className="tab-pane fade show active"
											id="nav-reserve"
											role="tabpanel"
											aria-labelledby="nav-reserve-tab"
										>
											<div className="tab-pane fade show active">
												<form
													className="auction-reserve-form"
													onSubmit={this.setReservePrice.bind(
														this
													)}
												>
													<div className="modal-body text-center">
														<p>
															Set your&nbsp;
															<strong>
																High and Low
																Prices
															</strong>
														</p>
														<p>
															Auctions run from
															the High Price down
															to the Low Price. A
															user may buy your
															Coin at any price
															between the two
															during the Auction.
														</p>
														<div className="input-group mb-2">
															<div className="input-group-prepend">
																<div className="input-group-text">
																	High:
																</div>
															</div>
															<NumberList
																selectorName="auction-reserve-highPrice"
																coinValue={
																	highPrice
																}
															/>
														</div>
														<div className="input-group mb-2">
															<div className="input-group-prepend">
																<div className="input-group-text">
																	Low:
																</div>
															</div>
															<NumberList
																selectorName="auction-reserve-lowPrice"
																coinValue={
																	lowPrice
																}
															/>
														</div>
													</div>
													<div className="modal-footer">
														<button
															type="submit"
															className="btn btn-primary"
														>
															Next
														</button>
													</div>
												</form>
											</div>
										</div>
										<div
											className="tab-pane fade"
											id="nav-time"
											role="tabpanel"
											aria-labelledby="nav-time-tab"
										>
											<div className="tab-pane fade show active">
												<form
													className="auction-confirm-form"
													onSubmit={this.confirmAuction.bind(
														this
													)}
												>
													<div className="modal-body text-center">
														<p>
															Set the&nbsp;
															<strong>
																Duration
															</strong>
														</p>
														<p>
															Your Auction will
															start immediately
															and run for the
															allocated period.
														</p>

														<NumberList
															selectorName="auction-confirm-duration"
															units="Day"
														/>
													</div>
													<div className="modal-footer">
														<button
															type="submit"
															className="btn btn-primary"
														>
															Confirm
														</button>
													</div>
												</form>
											</div>
										</div>
										<div
											className="tab-pane fade"
											id="nav-auctioned"
											role="tabpanel"
											aria-labelledby="nav-auctioned-tab"
										>
											<div className="tab-pane fade show active">
												<div className="modal-body text-center">
													<h3>Auction Live!</h3>
													<p>
														High Price: {highPrice}{' '}
														CƘr - Low Price:{' '}
														{lowPrice} CƘr
													</p>
													<p>
														Duration: {duration}{' '}
														Days
													</p>
													<div className="modal-coin-container">
														<CoinFrontBack
															width={300}
															coin={coin}
														/>
													</div>
												</div>
												<div className="modal-footer">
													<a
														href={'/marketplace' + (window.nonav ? '?nonav=1' : '')}
														className="btn btn-primary"
													>
														View Marketplace
													</a>
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
		);
	}
}

export default AuctionCoin;

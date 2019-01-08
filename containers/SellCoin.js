import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import NumberList from './NumberList';
import CoinFrontBack from './CoinFrontBack';

import '../css/sellCoin.css';

import { sellCoin, limits } from '../js/grab';
import { round, objectifyForm } from '../js/helpers';
import { sendGridviaEmail } from '../js/sos';
import { getUser, requireLogin } from '../js/auth';
import { openModal } from '../js/modal';

export function openSellCoinModal(props) {
	if (requireLogin()) {
		return;
	}

	openModal(SellCoin, props);
}

class SellCoin extends Component {
	state = {
		listPrice: (this.props.coin.value || this.props.coin.price) + 1,
	};
	sellCoin(event) {
		event.preventDefault();
		var _this = this,
			$form = $(event.target),
			listPrice = $form.find('.sellcoin-price').val(),
			sellBatch = _this.props.sellBatch;

		sellCoin(
			sellBatch ? '' : this.props.coin.coin,
			sellBatch ? this.props.coin.batch : '',
			listPrice,
			function(error, res) {
				if (error) {
					return $(document.body).trigger('messenger:show', [
						'error',
						error,
					]);
				}

				_this.setState({
					listPrice: listPrice,
				});

				$('#nav-tab a[href="#nav-listed"]').tab('show');
				if (_this.props.onSellRequest) {
					_this.props.onSellRequest();
				}
				if (_this.props.reloadNewsfeed) {
					_this.props.reloadNewsfeed();
				}
				$(document.body).trigger('coinAction:done');
			}
		);
	}
	showKYC() {
		openAsyncModal(
			import(/* webpackChunkName: "KYCModal" */ './KYCModal'),
			{ user: getUser(), afterAction: () => this.validCheck() }
		);
	}
	surrenderCoin(event) {
		//TODO - Contact form
		//Error minting coin
		//Textarea
		//only if you're the creator
		event.preventDefault();
		var _this = this,
			$form = $(event.target),
			data = objectifyForm($form.serializeArray()),
			user = getUser();

		limits(function(error, limits) {
			if (error) {
				return $(document.body).trigger('messenger:show', [
					'error',
					error,
				]);
			}
			if (limits && limits.kyc && !limits.kyc.kyc) {
				return _this.showKYC();
			}

			sendGridviaEmail(
				{
					sender: user.email,
					to: 'contact@support.kred',
					subject: _this.props.coin.name,
					template: 'a5bada04-25f3-47cd-9e81-e9c7c29aeba0',
					data: {
						usernametag: user.bio && user.bio.name,
						useridtag: user.id,
						emailtag: user.email,
						COINID: _this.props.coin.coin,
						coinprofilelink:
							'https://' +
							location.hostname +
							'/coin/' +
							_this.props.coin.symbol +
							'/' +
							_this.props.coin.sequence,
						reasontag: data.other
							? [data.text, data.other].join(' - ')
							: data.text,
						'-channel-': window.branding.tldCaps || 'Coin.Kred',
						'-channelurl-': window.branding.name || 'app.coin.kred'
					},
				},
				function(error) {
					if (error) {
						return $(document.body).trigger('messenger:show', [
							'error',
							error,
						]);
					}
					$(document.body).trigger('messenger:show', [
						'message',
						'Surrender requested. You will be notified if approved.',
					]);
					$('.sellcoin-modal').modal('hide');
					$(document.body).trigger('coinAction:done');
				}
			);
		});
	}
	render() {
		const { coin } = this.props;
		const { listPrice } = this.state;

		var isCreator = getUser().id === coin.creator;

		return (
			<div
				className="sellcoin-modal modal fade"
				tabIndex="-1"
				role="dialog"
				aria-hidden="true"
			>
				<div className="vertical-alignment-helper">
					<div className="modal-dialog modal-md vertical-align-center">
						<div className="modal-content">
							<nav>
								<div
									className="nav nav-tabs"
									id="nav-tab"
									role="tablist"
								>
									<a
										className="nav-item hidden active"
										id="nav-coinprice-tab"
										data-toggle="tab"
										href="#nav-coinprice"
										role="tab"
										aria-controls="nav-coinprice"
										aria-selected="true"
									/>
									<a
										className="nav-item hidden"
										id="nav-listed-tab"
										data-toggle="tab"
										href="#nav-listed"
										role="tab"
										aria-controls="nav-listed"
										aria-selected="false"
									/>
									<a
										className="nav-item hidden"
										id="nav-surrender-tab"
										data-toggle="tab"
										href="#nav-surrender"
										role="tab"
										aria-controls="nav-surrender"
										aria-selected="true"
									/>
									<a
										className="nav-item hidden"
										id="nav-surrendered-tab"
										data-toggle="tab"
										href="#nav-surrendered"
										role="tab"
										aria-controls="nav-surrendered"
										aria-selected="true"
									/>

									<div
										className="tab-content"
										id="nav-tabContent"
										style={{ width: '100%' }}
									>
										<div
											className="tab-pane fade show active"
											id="nav-coinprice"
											role="tabpanel"
											aria-labelledby="nav-coinprice-tab"
										>
											<form
												className="sellcoin-form"
												onSubmit={this.sellCoin.bind(
													this
												)}
											>
												<div className="modal-header">
													<h5 className="modal-title">
														Sell this Coin
													</h5>
													<button
														type="button"
														className="close"
														data-dismiss="modal"
														aria-label="Close"
													>
														<span aria-hidden="true">
															&times;
														</span>
													</button>
												</div>
												<div className="modal-body text-center">
													<p>
														Set a price that others
														can pay to buy your Coin
														from your Collection or
														the Marketplace
													</p>
													<p className="text-primary">
														SUGGESTED PRICE:{' '}
														{listPrice} CƘr
													</p>
													<NumberList
														selectorName="sellcoin-price"
														coinValue={listPrice}
													/>
												</div>
												<div className="modal-footer">
													{!!isCreator ? (
														<a
															className="pull-left"
															data-toggle="tab"
															href="#nav-surrender"
															role="tab"
															aria-controls="nav-surrender"
														>
															Request Surrender
														</a>
													) : null}

													<button
														type="submit"
														className="btn btn-primary"
													>
														Confirm
													</button>
												</div>
											</form>
										</div>
										<div
											className="tab-pane fade"
											id="nav-listed"
											role="tabpanel"
											aria-labelledby="nav-listed-tab"
										>
											<div className="tab-pane fade show active">
												<div className="modal-header">
													<h5 className="modal-title">
														Sell this Coin
													</h5>
													<button
														type="button"
														className="close"
														data-dismiss="modal"
														aria-label="Close"
													>
														<span aria-hidden="true">
															&times;
														</span>
													</button>
												</div>
												<div className="modal-body text-center">
													<h3>Listing Confirmed!</h3>
													<p>
														Listed Price:{' '}
														{listPrice} CƘr
													</p>
													<div className="modal-coin-container">
														<CoinFrontBack
															coin={coin}
															width={300}
														/>
													</div>
												</div>
												<div className="modal-footer">
													<a
														href={'/marketplace' + (window.nonav ? '?nonav=1' : '')}
														className="btn btn-primary"
													>
														View Sales
													</a>
												</div>
											</div>
										</div>
										<div
											className="tab-pane fade"
											id="nav-surrender"
											role="tabpanel"
											aria-labelledby="nav-surrender-tab"
										>
											<div className="tab-pane fade show active">
												<form
													className="surrendercoin-form"
													onSubmit={this.surrenderCoin.bind(
														this
													)}
												>
													<div className="modal-header">
														<h5 className="modal-title">
															Surrender this Coin
														</h5>
														<button
															type="button"
															className="close"
															data-dismiss="modal"
															aria-label="Close"
														>
															<span aria-hidden="true">
																&times;
															</span>
														</button>
													</div>
													<div className="modal-body">
														<div className="text-center">
															<p>
																Request to
																Surrender this
																Coin and have
																its face value
																in CƘr (minus
																10% fee)
																returned to your
																balance.
																Surrendered
																Coins are no
																longer public
																but may be
																reinstated by
																adding CƘr.
															</p>
															<CoinFrontBack
																coin={coin}
																width={300}
															/>
														</div>

														<div className="surrender-table">
															<div className="row">
																<div className="col">
																	<p>
																		Face
																		Value
																	</p>
																</div>
																<div className="col text-right">
																	<p>
																		{round(
																			coin.value,
																			2
																		)}{' '}
																		CƘr
																	</p>
																</div>
															</div>
															<div className="row">
																<div className="col">
																	<p>
																		10% Fee
																	</p>
																</div>
																<div className="col text-right">
																	<p>
																		-{' '}
																		{round(
																			coin.value *
																				0.1,
																			2
																		)}{' '}
																		CƘr
																	</p>
																</div>
															</div>
															<div className="row">
																<div className="col">
																	<p>
																		<strong>
																			You
																			will
																			Receive
																		</strong>
																	</p>
																</div>
																<div className="col text-right">
																	<p>
																		<strong>
																			{round(
																				coin.value -
																					coin.value *
																						0.1,
																				2
																			)}{' '}
																			CƘr
																		</strong>
																	</p>
																</div>
															</div>
														</div>

														<div>
															<p>
																<strong>
																	Reason for
																	surrendering
																	Coin:
																</strong>
															</p>
															<div className="custom-control custom-radio">
																<input
																	defaultChecked="checked"
																	type="radio"
																	id="text1"
																	name="text"
																	className="custom-control-input"
																	value="Not objectionable content"
																/>
																<label
																	className="custom-control-label"
																	htmlFor="text1"
																>
																	<span>
																		Error
																		when
																		creating
																		coin
																	</span>
																</label>
															</div>
															<div className="custom-control custom-radio">
																<input
																	type="radio"
																	id="text3"
																	name="text"
																	className="custom-control-input"
																	value="Other, please explain"
																/>
																<label
																	className="custom-control-label"
																	htmlFor="text3"
																>
																	<span>
																		Other,
																		please
																		explain
																	</span>
																</label>
															</div>
															<div className="row form-group">
																<div className="col-sm-11 offset-sm-1">
																	<input
																		type="text"
																		className="form-control"
																		name="other"
																	/>
																</div>
															</div>
														</div>
													</div>
													<div className="modal-footer">
														<button
															type="submit"
															className="btn btn-primary"
														>
															Request
														</button>
													</div>
												</form>
											</div>
										</div>
										<div
											className="tab-pane fade"
											id="nav-surrendered"
											role="tabpanel"
											aria-labelledby="nav-surrendered-tab"
										>
											<div className="tab-pane fade show active">
												<div className="modal-header">
													<h5 className="modal-title">
														Surrender this Coin
													</h5>
													<button
														type="button"
														className="close"
														data-dismiss="modal"
														aria-label="Close"
													>
														<span aria-hidden="true">
															&times;
														</span>
													</button>
												</div>
												<div className="modal-body text-center">
													<h3>Coin Surrendered!</h3>
													<p>
														{coin.value -
															coin.value *
																0.1}{' '}
														CƘr has been added to
														your balance
													</p>
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
		);
	}
}

export default SellCoin;

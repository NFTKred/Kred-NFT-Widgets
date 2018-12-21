import React, { Component } from 'react';
import '../css/giveaway.css';
import {getIPInfo, checkIfMobile} from '../js/helpers';
import {giveawayCoin, giveaways} from '../js/grab';
import { getUser } from '../js/auth';

class Giveaway extends Component {
	constructor(props) {
		super(props);

		this.state = {
			giveawayCode: '',
			coin: {}
		};
	}
	getGiveawayCode() {
		var _this = this,
			expiryInput = $('#datetimepicker1').val(),
			now = new Date().getTime(),
			expiry = new Date(expiryInput).getTime(),
			hours = (expiry - now) / 1000 / 60 / 60;

		if (!_this.props.coin.giveaway.avail && _this.props.coin.giveaway.reserved) {
			return giveaways(_this.props.coin.batch, function (error, giveaway) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}

				_this.setState({
					giveawayCode: giveaway[0] && giveaway[0].code
				});
				//$(document.body).trigger('coinAction:done');
			});
		}

		if (!_this.state.giveawayCode) {
			giveawayCoin(_this.props.coin.batch, _this.props.coin.giveaway.avail, Math.round(hours), function (error, giveaway) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}

				_this.setState({
					giveawayCode: giveaway.code
				});
				//$(document.body).trigger('coinAction:done');
			});
		}
	}
	copyToClipboard(event) {
		$(event.target).tooltip({
			trigger: 'manual',
			title: 'Copied!'
		});

		var copyText = $(event.target).closest('.input-group').find('.share-url');
		copyText.select();
		document.execCommand("Copy");

		$(event.target).tooltip('show');
		setTimeout(function () {
			$(event.target).tooltip('hide');
		}, 3000)
	}
	closeModal(event) {
		if (this.props.modalPopup) {
			event.preventDefault();
			$(event.target).closest('.giveaway-container').find('.giveaway-modal').removeClass('show').hide();
		} else {
			$(event.target).closest('.giveaway-container').find('.giveaway-modal').modal('toggle');
		}
	}
	openShare() {
		const { coin } = this.props;

		if (navigator.share) {
			navigator.share({
				title: ['Claim the', coin.name, 'Coin'].join(' '),
				text: 'Click to claim now!',
				url: [window.cryptoURL]
			}).then(() => {
				return $(document.body).trigger('messenger:show', ['message', 'Coin shared!']);
			}).catch((error) => {
				//return $(document.body).trigger('messenger:show', ['error', 'Error sharing coin!']);
			});
		}
	}
	downloadQRImage() {
		const { coin } = this.props;

		const canvas = document.querySelector('.qr-code-container > canvas');
		this.downloadRef.href = canvas.toDataURL();
		this.downloadRef.download = [coin.name, 'Coin QR Code.png'].join(' ');
	}
	render() {
		const {
			coin
			} = this.props;
		const {
			giveawayCode
			} = this.state;

		const loggedInUser = getUser();

		return (
				<div className="giveaway-modal modal fade" tabindex="-1" role="dialog" aria-hidden="true">
					<div className="vertical-alignment-helper">
						<div className="modal-dialog vertical-align-center">
							<div className="modal-content">
								<div className="modal-header">
									<h4 className="modal-title">Giveaway Links</h4>
									<button type="button" className="close" data-dismiss="modal" aria-label="Close">
										<span aria-hidden="true">&times;</span>
									</button>
								</div>
								<div className="modal-body">
										<div className="row smsrequest-settings">
											<div className="col-12">
											{!!giveawayCode && (
												<div>
													<p>Share this link to&nbsp;
														<strong>giveaway</strong>
													&nbsp;coin:</p>
													<div className="input-group form-control">
														<input type="text" className="form-control share-url"
															value={"https://" + location.hostname + "/claim/coin/" + coin.coin + "?giveaway=1&claim=" + giveawayCode} readOnly="readonly"/>
														<div className="input-group-append" onClick={(e) => this.copyToClipboard(e)}>
															<div>
																<i className="far fa-copy"></i>
															</div>
														</div>
													</div>
														<div className="row giveaway-mobile-options">
															<div className={"col-10 " + (navigator.share ? '' : 'col-xs-offset-1')}>
																<div className="qr-code-container">
																	<img src={"https://api.grab.live/code/qr?text=" + encodeURIComponent("https://" + location.hostname + "/claim/coin/" + coin.coin + "?giveaway=1&claim=" + giveawayCode)}/>
																</div>
															</div>
														{checkIfMobile() && navigator.share ? (
															<div className="col-2 text-center">
																<a className="share-btn" onClick={() => this.openShare()}><i class="fas fa-share-alt fa-2x"></i></a>
															</div>
														) : null}
														</div>
												</div>
											)}
											{loggedInUser.id === coin.creator && !giveawayCode && coin.giveaway && (
												<div>
													{!!coin.giveaway.avail || !!coin.giveaway.reserved ? (
														<div>
															<button type="button" className="btn btn-primary btn-sm" onClick={() => this.getGiveawayCode()}>Generate Links</button>
															<hr/>
															<p>
																<i className="fas fa-exclamation-circle"></i>
															&nbsp;This batch has&nbsp;
																<strong>{coin.giveaway && (coin.giveaway.avail || coin.giveaway.reserved)}</strong>
															&nbsp;Giveaway URL available</p>
														</div>
													) : (<p className="text-danger">No giveaway URLs available</p>)}
													<p>
														<i className="fas fa-exclamation-circle"></i>
													&nbsp;Anyone can claim without approval</p>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
		)
	}
}

export default Giveaway;

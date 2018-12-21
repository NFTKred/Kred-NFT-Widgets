import React, { Component } from 'react';
import '../css/requestLinks';
import {getIPInfo, checkIfMobile} from '../js/helpers';
import { getUser } from '../js/auth';

class RequestLinks extends Component {
	constructor(props) {
		super(props);

		this.state = {
			toggleSMSRequest: false,
			mobile: '',
			coin: {},
			gotData: false
		};
	}
	toggleSMSRequest(event) {
		var _this = this;

		if (_this.props.modalPopup) {
			event.preventDefault();
			$(event.target).closest('.requestLinks-container').find('.requestLinks-modal').addClass('show').show();
		} else {
			$(event.target).closest('.requestLinks-container').find('.requestLinks-modal').modal('toggle');
		}

		if (!_this.state.gotData) {
			getIPInfo(function (error, info) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}

				var country = info && info.country || '',
					mobile = '';

				switch (country) {
					case 'AU':
						mobile = window.testApp ? '+61447501576' : '+61448101909';
						break;
					case 'GB':
						mobile = window.testApp ? '+18447764815' : '+442033229216';
						break;
					default:
						mobile = window.testApp ? '+18447764815' : '+14156445733';
				}

				_this.setState({
					mobile: mobile,
					gotData: true
				});
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
			$(event.target).closest('.requestLinks-container').find('.requestLinks-modal').removeClass('show').hide();
		} else {
			$(event.target).closest('.requestLinks-container').find('.requestLinks-modal').modal('toggle');
		}
	}
	render() {
		const {
			coin,
			modalPopup
			} = this.props;
		const {
			toggleSMSRequest,
			mobile
			} = this.state;

		const loggedInUser = getUser();

		return (
			<div className="requestLinks-container row">
				{!!coin.code && (
					<div className="col-12">
						<p style={{cursor: 'pointer'}} onClick={(event) => this.toggleSMSRequest(event)}>
							<strong>Request Links</strong>
						&nbsp;
							<i className="fas fa-link"></i>
						</p>
					</div>
				)}
				<div className="requestLinks-modal modal fade">
					<div className="vertical-alignment-helper">
						<div className="modal-dialog vertical-align-center">
							<div className="modal-content">
								<div className="modal-header">
									<h4 className="modal-title">Request Links</h4>
									<button type="button" className="close" onClick={(event) => this.closeModal(event)}>
										<span aria-hidden="true">&times;</span>
									</button>
								</div>
								<div className="modal-body">
									<div className="smsrequest-settings text-left">
										<div className="row">
											<div className="col-12">
												<p>Share this link for anyone to&nbsp;
													<strong>request</strong>
												&nbsp;coin:</p>
												<div className="input-group form-control" onClick={(e) => this.copyToClipboard(e)}>
													<input type="text" className="form-control share-url"
														value={"https://" + location.hostname + "/coin/" + coin.symbol + "/" + coin.sequence + "?request=" + coin.code} readOnly="readonly"/>
													<div className="input-group-append">
														<div>
															<i className="far fa-copy"></i>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div className="row">
											<div className="col">
												<p style={{marginTop: '10px'}}>OR</p>
											</div>
										</div>
										<div className="row">
											<div className="col-12">
												<p>Anyone can request Coin by sending an SMS with code and their full name</p>
												<div className="form-group row">
													<label htmlFor="inputPassword" className="col-sm-2 col-form-label">Code: </label>
													<div className="col-sm-10">
														<input type="text" className="form-control text-center" readOnly="readonly" value={coin.code}/>
													</div>
												</div>
												<div className="form-group row">
													<label htmlFor="inputPassword" className="col-sm-2 col-form-label">Mobile: </label>
													<div className="col-sm-10">
														<input type="text" className="form-control text-center" readOnly="readonly" value={mobile}/>
													</div>
												</div>
											</div>
										</div>
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

export default RequestLinks;

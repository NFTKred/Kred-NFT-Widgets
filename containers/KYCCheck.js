import React, { Component } from 'react';
import async from 'async';
import $ from 'jquery';

import 'intl-tel-input/build/js/intlTelInput';
import 'intl-tel-input/build/js/utils';
import 'intl-tel-input/build/css/intlTelInput.css';
import { RegionDropdown } from 'react-country-region-selector';

import KYCUploader from './KYCUploader';

import {getLimits} from '../js/grab';
import {objectifyForm} from '../js/helpers';
import {userUpdate} from '../js/sos';

import {
	getUser,
	user,
	validateUser,
	confirmUser,
	registerDomain,
	userDirectionalLinked
	} from '../js/auth';

import '../css/KYCCheck';

class KYCCheck extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: getUser(),
			userCheck: this.props.userCheck || {},
			phone: '',
			showSMSInput: false,
			initInput: false,
			cc: '',
			state: '',
			username: ''
		};
	}

	componentWillMount() {
		if (this.props.userCheck) {
			this.check(false);
		} else {
			this.validCheck(false);
		}
	}

	componentDidMount() {
		var _this = this;
		$.get('https://ipinfo.io', function () {
		}, 'jsonp').always(function (resp) {
			var countryCode = (resp && resp.country) ? resp.country : '';
			_this.setState({
				cc: countryCode
			});
		});
	}

	validCheck(goBack) {
		var _this = this;

		getLimits(function (error, limits) {
			if (error) {
				return $(document.body).trigger('messenger:show', [
					'error',
					error
				]);
			}
			_this.setState({
				userCheck: limits.kyc
			});
			_this.check(goBack);
		});
	}

	check(goBack) {
		var _this = this,
			userCheck = _this.state.userCheck,
			$modalTitle = $('.createacoin-modal .modal-title');

		if (userCheck && (!userCheck.phone || !userCheck.kreddomain || !userCheck.location)) {
			//Show the validation panel
			if (!this.state.initInput) {
				if (!userCheck.phone) {
					setTimeout(function () {
						$('.KYCCheck-container').find('#kycphone').intlTelInput({
							utilsScript: 'https://static.socialos.net/stream/build/js/bower/intl-tel-input/utils.js',
							separateDialCode: true,
							initialCountry: 'auto',
							geoIpLookup: function (callback) {
								$.get('https://ipinfo.io', function () {
								}, 'jsonp').always(function (resp) {
									var countryCode = (resp && resp.country) ? resp.country : '';
									//countryRegion = (resp && resp.region) ? resp.region : '';
									callback(countryCode);
								});
							}
						});
						$('.KYCCheck-container .intl-tel-input').find('#kycphone').removeClass('hide');
					}, 200);
				}
			}

			if (!userCheck.kreddomain) {
				userDirectionalLinked('empire.kred', function (error, user) {
					if (error) {
						return;
					}

					_this.setState({
						username: user && user.name
					});

				});
			}

			this.setState({
				initInput: true
			});
			$modalTitle.find('input, i').hide();
			$modalTitle.find('span').show();
			return $('#nav-tab a[href="#nav-' + _this.props.validate + '"]').tab('show');
		}
		$modalTitle.find('input, i').show();
		$modalTitle.find('span').hide();
		if (_this.props.afterAction) {
			_this.props.afterAction();
		}
		if (goBack) {
			return $('#nav-tab a[href="#nav-' + _this.props.intro + '"]').tab('show');
		}
	}

	onSubmitPhone(event) {
		event.preventDefault();
		var _this = this,
			$input = $('.KYCCheck-container .intl-tel-input').find('#kycphone'),
			countryCode = $input.intlTelInput("getSelectedCountryData").iso2,
			dialCode = $input.intlTelInput("getSelectedCountryData").dialCode,
			regex = new RegExp('^\\+' + dialCode + dialCode, 'i'),
			input = $input.intlTelInput("getNumber").match(regex) ? $input.intlTelInput("getNumber").replace(regex, '+' + dialCode) : $input.intlTelInput("getNumber"),
			phone = intlTelInputUtils.formatNumber(input, countryCode),
			isValid = intlTelInputUtils.isValidNumber(input, countryCode);

		_this.setState({
			cc: countryCode && countryCode.toUpperCase()
		});

		if (!isValid) {
			return $(document.body).trigger('messenger:show', ['error', 'That number doesn\'t look right.. Please check and try again.']);
		}

		$(document.body).trigger('messenger:show', ['progress', 'Sending SMS to ' + phone]);

		validateUser('phone', phone && phone.replace(/-|\s/g, ''), 0, function (error, res) {
			if (error) {
				$(document.body).trigger('messenger:progressStop');
				return $(document.body).trigger('messenger:show', [
					'error',
					error
				]);
			}

			$('.KYCCheck-container .intl-tel-input').hide();

			userUpdate({
				phone: res.phone
			}, {}, '', function (error, profileData) {
				$(document.body).trigger('messenger:progressStop');
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}

				if (res.phone && res.phone_validated === "true") {
					_this.setState({
						phone: res.phone
					});
					return _this.validCheck(true);
				}

				_this.setState({
					showSMSInput: true,
					phone: phone && phone.replace(/-|\s/g, '')
				});
			});
		});
	}

	onSubmitSMSCode(event) {
		event.preventDefault();
		var _this = this,
			$form = $(event.target),
			data = objectifyForm($form.serializeArray());

		confirmUser(data.smscode, function (error, res) {
			if (error) {
				return $(document.body).trigger('messenger:show', [
					'error',
					error
				]);
			}
			_this.validCheck(true);
		});
	}

	onRequestVerification(event) {
		event.preventDefault();
		var _this = this,
			$input = $('.intl-tel-input').find('#kycphone'),
			countryCode = $input.intlTelInput("getSelectedCountryData").iso2,
			dialCode = $input.intlTelInput("getSelectedCountryData").dialCode,
			regex = new RegExp('^\\+' + dialCode + dialCode, 'i'),
			input = $input.intlTelInput("getNumber").match(regex) ? $input.intlTelInput("getNumber").replace(regex, '+' + dialCode) : $input.intlTelInput("getNumber"),
			phone = intlTelInputUtils.formatNumber(input, countryCode),
			isValid = intlTelInputUtils.isValidNumber(input, countryCode);

		if (!isValid) {
			return $(document.body).trigger('messenger:show', ['error', 'That number doesn\'t look right.. Please check and try again.']);
		}

		validateUser('phone', phone && phone.replace(/-|\s/g, ''), 1, function (error, res) {
			if (error) {
				return $(document.body).trigger('messenger:show', [
					'error',
					error
				]);
			}

			_this.setState({
				showSMSInput: true,
				phone: phone && phone.replace(/-|\s/g, '')
			});
		});
	}

	onSubmitDomain(event) {
		event.preventDefault();
		var _this = this,
			$form = $(event.target),
			data = objectifyForm($form.serializeArray()),
			kredDomain = data.kreddomain;

		if (!kredDomain.match(/.kred$/i)) {
			kredDomain = [kredDomain, 'kred'].join('.')
		}

		registerDomain(kredDomain, function (error, res) {
			if (error) {
				return $(document.body).trigger('messenger:show', [
					'error',
					error
				]);
			}
			_this.validCheck(true);
		});
	}

	onSubmitLocation(event) {
		event.preventDefault();
		var _this = this,
			$form = $(event.target),
			data = objectifyForm($form.serializeArray());

		//Set country code and state
		async.auto({
			setState: function (next) {
				validateUser('state', _this.state.state, 0, next);
			},
			setCC: function (next) {
				validateUser('cc', _this.state.cc, 0, next);
			},
			setUser: ['setState', 'setCC', function (res, next) {
				userUpdate({
					state: _this.state.state,
					cc: _this.state.cc
				}, {}, '', next);
			}]
		}, function (error, res) {
			if (error) {
				return $(document.body).trigger('messenger:show', [
					'error',
					error
				]);
			}
			_this.setState({
				state: data.state
			});
			_this.validCheck(true);
		});
	}

	selectRegion(val) {
		this.setState({state: val});
	}

	render() {
		const {showUploader} = this.props;
		const {
			user,
			userCheck,
			phone,
			showSMSInput,
			initInput,
			state,
			cc,
			username
			} = this.state;

		if (user && !user.id) {
			return (<h2>Please Log in or sign up</h2>);
		}

		const bioPhone = user && user.bio && user.bio.phone;

		if (!!initInput && bioPhone) {
			$('.KYCCheck-container').find('#kycphone').intlTelInput("setNumber", bioPhone);
		}

		return (
			<div className="KYCCheck-container">
			{!!showUploader ? (
				<p className="text-center">We need to verify your phone number, location, username and Identity before you can proceed.</p>
			) : (
				<p className="text-center">We need to verify your phone number, location and username.</p>
			)}


				<form onSubmit={this.onSubmitPhone.bind(this)}>
					<div className="row no-gutters">
						<div className="col-12 col-sm-2">
							<label for="validphone" className="mt-2">
								<strong style={{
									fontSize: '16px'
								}}>Phone:</strong>
							</label>
						</div>
						<div className="col-7 col-sm-6">
							{userCheck && !userCheck.phone && !phone ? (
								<input type="tel" id="kycphone" name="phone" className={"form-control" + (initInput ? ' hide' : '')} value={bioPhone || phone}/>
							) : (
								<p className="mt-2">{bioPhone || phone}</p>
							)}
						</div>
						<div className="col-5 col-sm-4 text-right">
								{userCheck && !userCheck.phone ? (
									<button
										type="submit"
										className="btn btn-primary btn-sm"
										disabled={showSMSInput}
									>
										Send SMS Code
									</button>
								) : (
									<p className="text-success mt-2">
										<strong>
											<i className="fas fa-check" />
										&nbsp;Verified
										</strong>
									</p>
								)}
						</div>
						{userCheck && !userCheck.phone ? (
							<a style={{
								margin: '10px 0 15px',
								fontSize: '14px',
								color: '#0056b3'
							}} onClick={this.onRequestVerification.bind(this)}>Can't receive SMS? Receive your code via a call instead</a>
						) : null}
					</div>
				</form>
					{showSMSInput &&
					(userCheck && !userCheck.phone) && (
						<div>
							<form
								className="mt-2"
								onSubmit={this.onSubmitSMSCode.bind(this)}
							>
								<div className="row no-gutters">
									<div className="col-12 col-sm-2">
										<label for="smscode">
											<strong style={{
												fontSize: '16px',
												'verticalAlign': 'sub'
											}}>Code:</strong>
										</label>
									</div>
									<div className="col-7 col-sm-6">
										<div className="form-group">
											<input
												required
												type="text"
												className="form-control"
												id="smscode"
												name="smscode"
												placeholder="123456"
											/>
										</div>
									</div>
									<div className="col-5 col-sm-4 text-right">
										<button
											type="submit"
											className="btn btn-primary btn-sm"
										>
											Validate Phone
										</button>
									</div>
								</div>
							</form>
						</div>
					)}
				{(userCheck && !userCheck.location && (user.bio && !user.bio.state && !state)) ? (
					<form
						className="mt-4"
						onSubmit={this.onSubmitLocation.bind(this)}
					>
						<div className="row no-gutters">
							<div className="col-12 col-sm-2">
								<label for="state">
									<strong style={{
										fontSize: '16px'
									}}>State:</strong>
								</label>
							</div>
							<div className="col col-7 col-sm-6">
								<div className="form-group">
									<RegionDropdown
										classes="form-control"
										countryValueType="short"
										country={cc}
										value={state}
										valueType="short"
										showDefaultOption={false}
										onChange={(val) => this.selectRegion(val)} />
								</div>
							</div>
							<div className="col-5 col-sm-4 text-right">
								<button
									type="submit"
									className="btn btn-primary btn-sm"
								>
									Save State
								</button>
							</div>
						</div>
					</form>
				) : (
					<div className="row mt-3 no-gutters">
						<div className="col-12 col-sm-2">
							<label for="kreddomain">
								<strong style={{
									fontSize: '16px'
								}}>State:</strong>
							</label>
						</div>
						<div className="col col-7 col-sm-6">
							<p>{(user.bio && user.bio.state) || state}</p>
						</div>
						<div className="col-5 col-sm-4 text-right">
							<p className="text-success">
								<strong>
									<i className="fas fa-check" />
								&nbsp;Verified
								</strong>
							</p>
						</div>
					</div>
				)}
				<hr />
					{userCheck && !userCheck.kreddomain ? (
						<form
							className="mt-4"
							onSubmit={this.onSubmitDomain.bind(this)}
						>
							<div className="row no-gutters">
								<div className="col-12 col-sm-2">
									<label for="kreddomain">
										<strong style={{
											fontSize: '16px'
										}}>Username:</strong>
									</label>
								</div>
								<div className="col col-7 col-sm-6">
									<div className="form-group">
										<input
											type="text"
											className="form-control"
											id="kreddomain"
											name="kreddomain"
											defaultValue={username}
											placeholder="Username"
										/>
									</div>
								</div>
								<div className="col-5 col-sm-4 text-right">
									<button
										type="submit"
										className="btn btn-primary btn-sm"
									>
										Confirm
									</button>
								</div>
							</div>
						</form>
					) : (
						<div className="row mt-3 no-gutters">
							<div className="col-12 col-sm-3">
								<label for="kreddomain">
									<strong style={{
										fontSize: '16px'
									}}>Username:</strong>
								</label>
							</div>
							<div className="col col-7 col-sm-5">
								<p>{user.home}</p>
							</div>
							<div className="col-5 col-sm-4 text-right">
								<p className="text-success">
									<strong>
										<i className="fas fa-check" />
									&nbsp;Verified
									</strong>
								</p>
							</div>
						</div>
					)}
				<hr />
				{!!this.props.userCheck || !!showUploader ? ( /*Only show this if it's in a modal*/
					<KYCUploader {...this.props} userCheck={userCheck} validCheck={this.validCheck}/>
				) : null}
			</div>
		)
	}
}

export default KYCCheck;
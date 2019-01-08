import React, { Component } from 'react';
import async from 'async';

import { getToken, kycUpload, getUserID} from '../js/auth';
import { objectifyForm } from '../js/helpers';
import { sendGrid } from '../js/sos';

import '../css/KYCUploader';

class KYCUploader extends Component {
	constructor(props) {
		super(props);

		this.state = {
			token: getToken()
		};
	}
	onSubmitIdentification(event) {
		event.preventDefault();
		var _this = this,
			$form = $(event.target),
			userCheck = _this.props.userCheck,
			data = objectifyForm($form.serializeArray()),
			photoIdFile = $form.find('.photoId')[0].files[0],
			selfieFile = $form.find('.selfie')[0].files[0],
			addressFile = $form.find('.address')[0].files[0];

		if (!$('.kyc-modal').length) {
			$("html, body").animate({ scrollTop: 0 }, "slow");
		}

		if (!photoIdFile && userCheck.driverslicense === 'missing' && userCheck.passport === 'missing') {
			return $(document.body).trigger('messenger:show', ['error', 'You must upload a photo ID']);
		}

		if (!selfieFile && userCheck.selfie === 'missing') {
			return $(document.body).trigger('messenger:show', ['error', 'You must upload a selfie']);
		}

		$(document.body).trigger('messenger:show', ['progress', 'Submitting. Please wait..']);
		$form.find('button').addClass('disabled');
		async.auto({
			'uploadPhotoId': function (next) {
				if (!photoIdFile) {
					return next();
				}
				return kycUpload(photoIdFile, data.photoIdType, next);
			},
			'uploadSelfie': ["uploadPhotoId", function (res, next) {
				if (!selfieFile) {
					return next();
				}
				return kycUpload(selfieFile, 'selfie', next);
			}],
			'uploadAddress': ["uploadSelfie", function (res, next) {
				if (!addressFile) {
					return next();
				}
				return kycUpload(addressFile, 'address', next);
			}],
			'uploadOptional': ["uploadAddress", function (res, next) {
				async.each($form.find('.optional-files').find('input'), function ($item, next) {
					if ($item.files && $item.files.length) {
						return kycUpload($item.files[0], 'optional', next);
					}
					return next();
				}, next);
			}],
			sendPendingEmail: ['uploadPhotoId', 'uploadSelfie', 'uploadAddress', 'uploadOptional', function (res, next) {
				sendGrid({
					sender: 'contact@peoplebrowsr.ceo',
					to: getUserID(),
					subject: '\n',
					template: 'd221c4e8-72c0-4eb4-ad80-8289d2f310dd',
					data: {
						'-channel-': window.branding.tldCaps || 'Coin.Kred',
						'-channelurl-': window.branding.name || 'app.coin.kred'
					}
				}, next);
			}]
		}, function (error, res) {
			$(document.body).trigger('messenger:progressStop');
			if (error) {
				$form.find('button').removeClass('disabled');
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$(document.body).trigger('messenger:show', ['message',
				'Your documents have been successfully submitted. Verification typically takes 2 business days and we ' +
				'will notify you by email as soon as you\'ve been approved.']);
			return _this.props.validCheck(true);
		});
	}
	onFileUpload(event) {
		var name = $(event.target)[0].files[0].name;
		$(event.target).closest('.form-group').find('.file-name').html(name);

		if (!!$(event.target).attr('data-upload-type')) {
			$(event.target).closest('.form-group').next().removeClass('hidden');
		}
	}
	render() {
		const {user, userCheck} = this.props;
		const {} = this.state;

		if (userCheck && userCheck.kyc) {
			return (
				<div className="row mt-3 no-gutters">
					<div className="col-6 col-sm-6">
						<label for="kreddomain">
							<strong style={{
								fontSize: '16px'
							}}>Identity:</strong>
						</label>
					</div>
					<div className="col-6 col-sm-6 text-right">
						<p className="text-success">
							<strong>
								<i className="fas fa-check" />
							&nbsp;Verified
							</strong>
						</p>
					</div>
				</div>
			)
		}

		return (
			<div className="KYCUpload-container">
				<h4>
					<strong>Verify Identity</strong>
				</h4>
				<div className="alert alert-primary" role="alert">The following information is required for us to verify you as an individual to
					conform with Australia's Anti Money Laundering (AML) and Counter Terrorism Financing (CTF) laws. This data will be used for
					verification purposes only and will be treated in a responsible and secure manner as per the terms of our Privacy Policy.
					<br/>
					You may refer to our AML Policy for further details.
				</div>
				<form onSubmit={this.onSubmitIdentification.bind(this)}>
					<div className="form-group photoId-form">
						<h4>
							<strong>Driver's License or Passport* <small className="pull-right"><strong>Status:</strong> {userCheck.driverslicense !== 'missing' ? userCheck.driverslicense : userCheck.passport}</small></strong>
						</h4>
						<p>Please upload a close up of a Goverment issued photo ID such as a passport or drivers licence. Please make sure that
							the photo is complete and clearly visible including licence number and expiry date. If the expiry date or other
							pertinent information is on the back of the documentation, please upload a separate photo of the back in the below
							Optional section.</p>
						<div className="custom-radio-group">
							<div className="custom-control custom-radio">
								<input type="radio" id="photoIdType1" name="photoIdType" value="driverslicense" className="custom-control-input"/>
								<label className="custom-control-label" for="photoIdType1">
									<span>Driver's License</span>
								</label>
							</div>
							<div className="custom-control custom-radio">
								<input type="radio" id="photoIdType2" name="photoIdType" value="passport" className="custom-control-input"/>
								<label className="custom-control-label" for="photoIdType2">
									<span>Passport</span>
								</label>
							</div>
						</div>
						<label for="photoId" className="btn btn-primary btn-sm">
							Choose File
						</label>
						<input type="file" id="photoId" className="photoId" name="photoId" onChange={this.onFileUpload.bind(this)}/>
						<p className="file-name"></p>
					</div>

					<div className="form-group">
						<h4>
							<strong>Selfie* <small className="pull-right"><strong>Status:</strong> {userCheck.selfie}</small></strong>
						</h4>
						<p>Please upload a clear photo of yourself. Your face must be clearly visible.
							<br/>
							Face clearly visible</p>
						<label for="selfie" className="btn btn-primary btn-sm">
							Choose File
						</label>
						<input type="file" id="selfie" className="selfie" name="selfie" onChange={this.onFileUpload.bind(this)}/>
						<p className="file-name"></p>
					</div>

					<div className="form-group">
						<h4>
							<strong>Proof of address</strong>
						</h4>
						<p>Please upload at least one supporting document which shows your current address, such as a bank statement or utility bill.
							Ensure that a date is visible proving that the document is less than 6 month old. Note that we do not accept PO box addresses.</p>
						<label for="address" className="btn btn-primary btn-sm">
							Choose File
						</label>
						<input type="file" id="address" className="address" name="address" onChange={this.onFileUpload.bind(this)}/>
						<p className="file-name"></p>
					</div>


					<div className="form-group">
						<h4>
							<strong>Optional</strong>
						</h4>
						<p>Upload any additional documents. eg. Back of Driver's License</p>
						<div className="optional-files">
							<div className="form-group">
								<label for="optionalOne" className="btn btn-primary btn-sm">
									Choose File
								</label>
								<input type="file" id="optionalOne" className="optionalOne" name="optionalOne" data-upload-type="optional" onChange={this.onFileUpload.bind(this)}/>
								<p className="file-name"></p>
							</div>
							<div className="form-group hidden">
								<label for="optionalTwo" className="btn btn-primary btn-sm">
									Choose File
								</label>
								<input type="file" id="optionalTwo" className="optionalTwo" name="optionalTwo" data-upload-type="optional" onChange={this.onFileUpload.bind(this)}/>
								<p className="file-name"></p>
							</div>
							<div className="form-group hidden">
								<label for="optionalThree" className="btn btn-primary btn-sm">
									Choose File
								</label>
								<input type="file" id="optionalThree" className="optionalThree" name="optionalThree" data-upload-type="optional" onChange={this.onFileUpload.bind(this)}/>
								<p className="file-name"></p>
							</div>
						</div>
					</div>
					<button type="submit" className="btn btn-primary btn-sm pull-right">Submit for Verification</button>
				</form>
			</div>
		)
	}
}

export default KYCUploader;
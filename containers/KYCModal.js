import React, { Component } from 'react';
import KYCCheck from './KYCCheck';
import {limits} from '../js/grab';

class KYCModal extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentDidMount() {
		$('.kyc-modal').on('hidden.bs.modal', function (e) {
			this.remove();
		});
	}
	componentWillMount() {
		this.validCheck();
	}
	validCheck() {
		var _this = this;

		limits(function (error, limits) {
			if (error) {
				return $(document.body).trigger('messenger:show', [
					'error',
					error
				]);
			}
			if (limits.kyc && (!limits.kyc.phone || !limits.kyc.kreddomain || (!limits.kyc.kyc && !limits.kyc.accept_fiat))) {
				//Show the validation panel
				_this.setState({
					userCheck: limits.kyc
				});
				return $('.kyc-modal').modal({
					show: true,
					backdrop: 'static'
				});
			}
			return $('.kyc-modal').modal('hide');
		});
	}
	render() {
		const {userCheck} = this.state;
		return (
			<div className="kyc-modal modal fade">
				<div className="vertical-alignment-helper">
					<div className="modal-dialog modal-md vertical-align-center">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" style="position: absolute; right: 10px;">&times;</button>
								<h5 className="modal-title">Verify yourself</h5>
							</div>
							<div className="modal-body">
								<KYCCheck {...this.props} userCheck={userCheck}/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default KYCModal;
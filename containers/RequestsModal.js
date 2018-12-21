import React, { Component } from 'react';
import _ from 'underscore';

import {getAvatar} from '../js/helpers';
import {giftCoin, getFreshRequests} from '../js/grab';
import {sendSMSEmailCoin} from '../js/auth';

import '../css/requestModal.css';

class RequestsModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			requests: this.props.requests || []
		};
	}
	componentDidMount() {
		$('.coin-action-modals').on('hidden.bs.modal', function (e) {
			this.remove();
		});
	}
	componentWillMount() {
		var _this = this;
		if (!_this.props.requests) {
			return getFreshRequests({coin: _this.props.coin.coin}, function (error, requests) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				_this.setState({
					requests: requests
				});
			});
		}
	}
	giveCoin(request) {
		var _this = this,
			$modal = $('.requestsmodal-modal');

		$modal.find('button').addClass('disabled');

		$(document.body).trigger('messenger:show', ['progress', 'Giving coin..']);

		if (request.platform === 'sms') {
			return sendSMSEmailCoin(_this.props.coin.coin, 'sms', request.address, 'I gave ' + request.name + ' this coin!', 0, function (error, res) {
				$(document.body).trigger('messenger:progressStop');
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				$(document.body).trigger('messenger:show', ['message', 'Coin given!']);
				$modal.modal('hide');
				return $(document.body).trigger('coinAction:done');
			});
		} else {
			return giftCoin({coin: _this.props.coin.coin}, request.wallet, '', function (error, res) {
				$(document.body).trigger('messenger:progressStop');
				$modal.find('button').removeClass('disabled');
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				$(document.body).trigger('messenger:show', ['message', 'Coin given!']);
				$modal.modal('hide');
				return $(document.body).trigger('coinAction:done');
			});
		}
	}
	inboxRequest(request) {
		var _this = this,
			$inboxModal = $('#inboxModal');

		if (!_this.props.loggedInUser.id) {
			return $('.signup-modal').modal({
				show: true,
				backdrop: 'static'
			});
		}

		$('.requestsmodal-modal').modal('hide');
		$inboxModal.modal('show');

		var data = request;

		if ($('.compose-connection-search').find('option[value="' + data.user + '"]').length === 0) {
			var option = new Option('', data.user, true, true);
			$('.compose-connection-search').append(option).trigger('change');

			var optionData = $('.compose-connection-search').find('option[value="' + data.user + '"]').data().data;

			$('.compose-connection-search').find('option[value="' + data.user + '"]').data().data = $.extend(optionData, {
				avatar: data.avatar,
				bio: "",
				name: data.name,
				text: data.name,
				id: data.user,
				user: data.user
			});
		}

		// manually trigger the `select2:select` event
		$('.compose-connection-search').trigger({
			type: 'select2:select',
			params: {
				data: {
					avatar: data.avatar,
					bio: "",
					name: data.name,
					text: data.name,
					id: data.user,
					user: data.user
				}
			}
		});

		$inboxModal.find('.compose-connection-search').empty();
		$inboxModal.find('.sent-message-view').remove();
		$(".compose-connection-search").hide();
	}
	render() {
		const {
			loggedInUser,
			coin
			} = this.props;

		const {
			requests
			} = this.state;

		const isOwner = loggedInUser.id === coin.user;

		return (
			<div className="requestsmodal-modal modal fade" tabindex="-1" role="dialog" aria-hidden="true">
				<div className="vertical-alignment-helper">
					<div className="modal-dialog modal-md vertical-align-center">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Requests</h5>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>

							<div className="modal-body">
							{_.uniq(requests, function (request) {
								return request.user;
							}).map((request) => {
								const requestByOwner = loggedInUser.id === request.user, //Don't show 'Give' if it's the owner
									name = request.name || 'Anon',
									avatar = getAvatar(request) || 'https://d30p8ypma69uhv.cloudfront.net/stream/uploads/53756175b7725d370d9a208f_b91f434779e3f4a5f80d4b2373394d83_defaultAvatar.jpg';

								return (<div className="row request-item">
									<div className="col-8">
										<img className="request-item-avatar" src={avatar} alt={name}
											onError="this.onerror=null;this.src='https://d30p8ypma69uhv.cloudfront.net/stream/uploads/53756175b7725d370d9a208f_b91f434779e3f4a5f80d4b2373394d83_defaultAvatar.jpg'"
										/>
										<p className="request-item-author" title={name}>{name}</p>
									</div>
									{isOwner && !coin.held && !requestByOwner && (
										<div className="col-4 text-right">
											<i className="fas fa-edit" onClick={() => this.inboxRequest(request)}></i>
											<button type="button" className="btn btn-primary btn-sm" onClick={() => this.giveCoin(request)}>Give</button>
										</div>
									)}
								</div>);
							})}
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default RequestsModal;
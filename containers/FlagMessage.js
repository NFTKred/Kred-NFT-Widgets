import React from 'react';
import async from 'async';
import {objectifyForm, formatDisplayName, getAvatar} from '../js/helpers';
import { flag } from '../js/grab';
import { sendGrid, sendGridviaEmail } from '../js/sos';


const FlagMessage = React.createClass({
	getInitialState() {
		return {};
	},
	componentDidMount: function () {
	},
	flagMessage(event) {
		event.preventDefault();
		var _this = this,
			$form = $(event.target),
			data = objectifyForm($form.serializeArray());

		const { message } = this.props;

		async.auto({
			'toOwner': function (next) {
				sendGridviaEmail({
					sender: _this.props.loggedInUser.email,
					to: 'vip@support.kred',
					subject: _this.props.coin.name,
					template: 'b19bdc1c-c754-43d7-a015-20f2f779d2c1',
					data: {
						commenterAvatar: getAvatar(message.user),
						commenterName: formatDisplayName(message.user),
						commentMessage: message.text,
						flagReason: data.text,
						COINID: _this.props.coin.coin,
						COINNAME: _this.props.coin.name,
						coinprofilelink: 'https://' + location.hostname + '/coin/' + _this.props.coin.symbol + '/' + _this.props.coin.sequence,
						'-channel-': window.branding.tldCaps || 'Coin.Kred',
						'-channelurl-': window.branding.name || 'app.coin.kred'
					}
				}, next);
			},
			'toFlagger': function (next) {
				sendGrid({
					sender: 'vip@support.kred',
					to: _this.props.loggedInUser.id,
					subject: _this.props.coin.name,
					template: '24f413d0-90c0-405c-ab9c-72d7849702c7',
					data: {
						COINNAME: _this.props.coin.name,
						coinprofilelink: 'https://' + location.hostname + '/coin/' + _this.props.coin.symbol + '/' + _this.props.coin.sequence,
						'-channel-': window.branding.tldCaps || 'Coin.Kred',
						'-channelurl-': window.branding.name || 'app.coin.kred'
					}
				}, next);
			}
		}, function (error) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$('.flagmessage-modal').modal('hide');
			return $(document.body).trigger('messenger:show', ['message', 'Comment has been flagged!']);
		});
	},
	render: function () {
		const {coin} = this.props;

		return (
			<div className="flagmessage-modal modal fade">
				<div className="vertical-alignment-helper">
					<div className="modal-dialog modal-sm vertical-align-center">
						<div className="modal-content">
							<div className="modal-header">
								<h4 className="modal-title">Flag this comment</h4>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<form onSubmit={(e) => this.flagMessage(e)}>
								<div className="modal-body">
									<div class="custom-control custom-radio">
										<input checked="checked" type="radio" id="text1" name="text" class="custom-control-input" value="It displays a sensitive image"/>
										<label class="custom-control-label" for="text1">
											<span>It displays a sensitive image</span>
										</label>
									</div>
									<div class="custom-control custom-radio">
										<input type="radio" id="text2" name="text" class="custom-control-input" value="It's abusive or harmful"/>
										<label class="custom-control-label" for="text2">
											<span>It's abusive or harmful</span>
										</label>
									</div>
									<div class="custom-control custom-radio">
										<input type="radio" id="text3" name="text" class="custom-control-input" value="They're pretending to be me or someone else"/>
										<label class="custom-control-label" for="text3">
											<span>They're pretending to be me or someone else</span>
										</label>
									</div>
								</div>
								<div className="modal-footer">
									<button type="submit" className="btn btn-primary btn-sm">Submit</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		)
	}
});

export default FlagMessage;
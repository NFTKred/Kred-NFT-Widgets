import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';

import CommentPostBox from './CommentPostBox'
import CoinComment from './CoinComment';

import {formatDisplayName} from '../js/helpers';
import {getWallets, requestCoin} from '../js/grab';
import { sendGrid } from '../js/sos';
import { requireLogin } from '../js/auth';

class CoinCommentsSettings extends Component {
	constructor(props) {
		super(props);

		this.state = {
			tags: [],
			toggleTag: false,
			gas: 0,
			showcase: false,
			newMessage: false,
			requestStatus: 'Request'
		};
	}
	toggleSetting(event) {
		this.setState({
			toggleTag: !this.state.toggleTag
		});
	}
	postBox() {
		if (requireLogin()) {
			return;
		}

		if (this.props.modalPopup) {
			event.preventDefault();
			$('.commentpostbox-modal').addClass('show').show();
		} else {
			$('.commentpostbox-modal').modal('show');
		}
	}
	hasNewPost() {
		this.setState({
			newMessage: true
		});
	}
	renderedNewPost() {
		this.setState({
			newMessage: false
		});
	}
	requestCoin(event) {
		event.preventDefault();

		var _this = this,
			$target = $(event.target);

		if (requireLogin()) {
			return;
		}

		return getWallets(_this.props.loggedInUser.id, function (error, wallets) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			var wallet = _.first(wallets),
				coin = _this.props.coin;
			if (!wallet) {
				return $(document.body).trigger('messenger:show', ['error', 'You have no wallet!']);
			}
			requestCoin(coin.coin, wallet.wallet, function (error, request) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				_this.setState({
					requestStatus: 'Requested'
				});
				sendGrid({
					sender: 'contact@peoplebrowsr.ceo',
					to: coin.user,
					subject: coin.name,
					template: '3f2d527c-fa31-4518-9d6f-fd5d4688d5bf',
					data: {
						REQUESTOR: formatDisplayName(_this.props.loggedInUser),
						COINID: coin.coin,
						COINNAME: coin.name,
						GIVECOINLINK: 'https://' + location.hostname + '/coin/' + coin.symbol + '/' + coin.sequence + '?viewrequests=1',
						'-channel-': 'Coin.Kred',
						'-channelurl-': 'app.coin.kred'
					}
				}, function (error, request) {
					if (error) {
						return $(document.body).trigger('messenger:show', ['error', error]);
					}
					return $(document.body).trigger('messenger:show', ['message', 'Request has been sent!']);
				});
			});
		});
	}
	render() {
		const {
			loggedInUser,
			isOwner,
			coin,
			modalPopup,
			route,
			viewOnly
			} = this.props;
		const {
			tags,
			toggleTag,
			gas,
			showcase,
			newMessage,
			requestStatus
			} = this.state;

		return (
			<div>
				{!viewOnly && (
					<h4 className="coinprofile-widget-header">
						<span className="pull-right coin-actions">
							{/* Only coin touchers can comment */}
							{isOwner || !!(!!coin.is_member && !coin.is_banned) ? (
								<span onClick={() => this.postBox()}>
									<i className="fas fa-edit"></i>
								</span>
							) : null }
						</span>
					</h4>
				)}

				{!!coin.is_member && !coin.is_banned && (
					<CommentPostBox coin={coin} hasNewPost={() => this.hasNewPost()} modalPopup={modalPopup}/>
				)}
				<CoinComment {...this.props}
					coin={coin}
					hasOwned={!!coin.is_member && !coin.is_banned}
					isCreator={loggedInUser.id === coin.creator}
					hasNewPost={() => this.hasNewPost()}
					newMessage={newMessage}
					renderedNewPost={() => this.renderedNewPost}
					onPostBox={() => this.postBox()}
					onRequest={this.requestCoin.bind(this)}
					requestStatus={requestStatus}
					route={route}
				/>
			</div>
		)
	}
}

export default CoinCommentsSettings;

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';

import EditCoinMeta from './EditCoinMeta';
import RequestLinks from './RequestLinks'
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import '../css/coinSettings.css';

import {objectifyForm, formatDisplayName} from '../js/helpers';
import { hideCoin, showCoin, saveTags, gas, canShowcase, showcase, unshowcase, makeCoinPrivate, makeCoinPublic, sendCoin, limits, getWallets, requestCoin} from '../js/grab';
import { sendGrid } from '../js/sos';
import { getUser, getUserID, requireLogin } from '../js/auth';
import { openAsyncModal } from '../js/modal';

class CoinSettings extends Component {
	constructor(props) {
		super(props);

		this.state = {
			tags: props.coin && props.coin.tags || [],
			toggleExternalTag: false,
			gas: 0,
			showcase: false,
			newMessage: false,
			requestStatus: 'Request',
			coin: props.coin
		};
	}
	componentWillMount() {
		this.loadData(this.props);
	}
	componentWillReceiveProps(nextProps) {
		this.loadData(nextProps);
	}
	loadData(props) {
		//Get coin
		var _this = this;

		if ((props.coin && props.coin.coin) === (_this.state.coin && _this.state.coin.coin)) {
			return;
		}
		_this.setState({
			coin: props.coin,
			tags: !_.isEmpty(_this.state.tags) ? _this.state.tags : props.coin && props.coin.tags || []
		});

		return canShowcase(function (error, canShowcase) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			_this.setState({
				showcase: canShowcase.status
			});

		});

	}
	toggleSetting(event) {
		this.setState({
			toggleTag: !this.state.toggleTag
		});
	}
	toggleExternalSetting(event) {
		this.setState({
			toggleExternalTag: !this.state.toggleExternalTag
		});
	}
	tagsInput(tags) {
		var _this = this,
			data = _this.props.batch ? {batch: _this.props.batch} : {coin: _this.props.coin.coin};

		// Update coin tags
		saveTags(_.extend(data, {
			mode: 'replace',
			tags: _.compact(tags).join(',')
		}), function (error, coin) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			_this.setState({
				tags: tags,
				toggleTag: true
			});
		});
	}
	updateCollectionView(event) {
		var _this = this,
			isChecked = $(event.target).is(':checked'),
			data = _this.props.batch ? {batch: _this.props.batch} : {coin: _this.props.coin.coin};

		// Update coin hidden
		if (isChecked) {
			showCoin(data, function (error, coin) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
			});
		} else {
			hideCoin(data, function (error, coin) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
			});
		}
	}
	updateShowcase(event) {
		var _this = this,
			isChecked = $(event.target).is(':checked'),
			data = _this.props.batch ? {batch: _this.props.batch} : {coin: _this.props.coin.coin};

		// Update coin hidden
		if (isChecked) {
			showcase(data, function (error, coin) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
			});
		} else {
			unshowcase(data, function (error, coin) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
			});
		}
	}
	updatePrivacy(event) {
		var _this = this,
			isChecked = $(event.target).is(':checked'),
			data = _this.props.batch ? {batch: _this.props.batch} : {coin: _this.props.coin.coin};

		// Update coin hidden
		if (isChecked) {
			makeCoinPrivate(data, function (error, coin) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				_this.setState({
					coin: coin
				});
			});
		} else {
			makeCoinPublic(data, function (error, coin) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				_this.setState({
					coin: coin
				});
			});
		}
	}
	toggleWallet(event) {
		var _this = this,
			isEthereum = $(event.target).is(':checked');

		//All transactions besides stellar > stellar will incur a gas fee
		if (!isEthereum) {
			return _this.setState({
				gas: 0
			});
		} else {
			gas('ethereum', function (error, gas) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				_this.setState({
					gas: gas.price
				});
			});
		}
	}
	sendCoin(data) {
		var _this = this;
		limits(function (error, limits) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			if (limits.kyc && !limits.kyc.export_allowed) {
				return $(document.body).trigger('messenger:show', ['error', 'No permission to export.']);
			}

			sendCoin({
				platform: _this.state.gas ? 'ethereum' : 'stellar',
				address: data.walletAddress,
				coin: _this.props.coin.coin
			}, function (error, res) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				return $(document.body).trigger('messenger:show', ['message', 'Sent!']);
			});
		});
	}
	exportCoinUsingMetamask(event) {
		event.preventDefault();
		var _this = this,
			$form = $(event.target),
			data = objectifyForm($form.serializeArray());


	}
	requestCoin(event) {
		event.preventDefault();

		var _this = this,
			$target = $(event.target);

		if (requireLogin()) {
			return;
		}

		return getWallets(getUser().id, function (error, wallets) {
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
					sender: 'vip@support.kred',
					to: coin.user,
					subject: coin.name,
					template: '3f2d527c-fa31-4518-9d6f-fd5d4688d5bf',
					data: {
						REQUESTOR: formatDisplayName(getUser()),
						COINID: coin.coin,
						COINNAME: coin.name,
						GIVECOINLINK: 'https://' + location.hostname + '/coin/' + coin.symbol + '/' + coin.sequence + '?viewrequests=1',
						'-channel-': window.branding.tldCaps || 'Coin.Kred',
						'-channelurl-': window.branding.name || 'app.coin.kred'
					}
				}, function (error, request) {
					if (error) {
						return $(document.body).trigger('messenger:show', ['error', error]);
					}
					return $(document.body).trigger('messenger:show', ['message', 'Request has been sent! <a href="/newsfeed" class="alert-link">View in Newsfeed</a>']);
				});
			});
		});
	}
	render() {
		const {
			toggleTag,
			showExport,
			modalPopup,
			batch,
			hideTagsEdit
			} = this.props;
		const {
			coin,
			tags,
			toggleExternalTag,
			showcase
			} = this.state;

		var isIssuer = getUserID() === coin.creator;

		return (
			<div className={"row coinsettings-settings" + (toggleTag ? '' : ' hide')} >
				{!hideTagsEdit ? (
					<div className="col-12" style={{marginBottom: '5px'}}>
						<TagsInput value={_.compact(tags)} onChange={this.tagsInput.bind(this)}
							addKeys={[9, 13, 32, 188]}
							inputProps={{placeholder: 'Add tags'}}
						/>
					</div>
				) : null}
				<div className="col-12">
					<div className="custom-control custom-checkbox">
						<input type="checkbox" className="custom-control-input" id="collectionView" name="collectionView"
							checked={!!coin.show || true}
							onChange={this.updateCollectionView.bind(this)}/>
						<label className="custom-control-label" htmlFor="collectionView">
							<span>Show in Collection</span>
						</label>
					</div>
				</div>
							{!!showcase && (
								<div className="col-12">
									<div className="custom-control custom-checkbox">
										<input type="checkbox" className="custom-control-input" id="showcase" name="showcase"
											checked={!!coin.showcase || false}
											onChange={this.updateShowcase.bind(this)}/>
										<label className="custom-control-label" htmlFor="showcase">
											<span>Showcase this coin</span>
										</label>
									</div>
								</div>
							)}
							{(!coin.mesh || (!!coin.mesh && (coin.count === (coin.giveaway && coin.giveaway.coins)))) && (
								<div className="col-12" style={{marginBottom: '5px'}}>
									<div className="custom-control custom-checkbox">
										<input type="checkbox" className="custom-control-input" id="private" name="private"
											checked={!!coin.private || false}
											onChange={this.updatePrivacy.bind(this)}/>
										<label className="custom-control-label" htmlFor="private">
											<span>Private</span>
										</label>
									</div>
								</div>)}
				{isIssuer ? <EditCoinMeta coin={coin} style={{marginBottom: '5px'}}/> : null}

				{showExport && (<div className="col-12" style={{marginBottom: '5px'}}>
					<p style={{cursor: 'pointer', marginBottom: '5px'}} onClick={this.toggleExternalSetting}>
						<strong>Export</strong>
					&nbsp;
						<i className="fas fa-sign-out-alt"></i>
					</p>
				</div>)}
				<div className={"row sendexternal-settings" + (toggleExternalTag ? '' : ' hide')} >
					<div className="col-12">
						<p>
							<strong>Send to an external wallet</strong>
						</p>
						<p>Once sent to an external wallet, this Coin will be moved to Out of Circulation in your Collection.
							The Coin Profile and conversation will only be accessible to those who have already held the Coin</p>
					</div>
				</div>
				<RequestLinks {...this.props} coin={coin} modalPopup={modalPopup}/>
			</div>
		)
	}
}

export default CoinSettings;

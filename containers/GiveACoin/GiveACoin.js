import React from 'react';
import async from 'async';
import _ from 'underscore';

import CoinFrontBack from '../CoinFrontBack';
import '../../css/giveACoin.css';

import CreatableSelect from 'react-select/lib/Creatable';

import 'react-tagsinput/react-tagsinput.css'

import {getWalletCoins, getContacts, coinContacts, search} from '../../js/grab';
import {objectifyForm, formatDisplayName} from '../../js/helpers';
import {sendSMSEmailCoin, getEKTickerUser, user, isUserLoggedIn, getUser} from '../../js/auth';

var timeout;

const GiveACoin = React.createClass({
	getInitialState() {
		return {
			isLoading: true,
			selectedCoin: this.props.coin,
			recipientsData: [],
			recipientsAddress: [],
			recipient: '',
			recipientName: '',
			//recipientId: '',
			recipientType: '',
			coins: [],
			page: 1,
			searchPage: 1,
			searching: false,
			searchedOption: [],
			searchInput: '',
			recipientInputCount: 1,
			localContacts: []
		};
	},
	componentDidMount: function () {
		$('.giveacoin-modal .btnPrevious').click(function () {
			$('.giveacoin-modal .nav-tabs > .active')
				.prev('a')
				.tab('show');
		});

		//Get minted coins
		var _this = this;

		$('#coinSelectorControls').on('slid.bs.carousel', function () {
			// do something…
			_this.setState({
				page: _this.state.page + 1
			});
			return _this.getCoins(function (error, coins) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}

				_this.setState({
					coins: _.uniq(_.filter(_this.state.coins.concat(coins), function (coin) {
						return !coin.held;
					}), function (coin) {
						return coin.coin;
					})
				});
			});
		});

		if (_this.state.selectedCoin && _this.state.selectedCoin.coin) {
			$('#nav-tab a[href="#nav-recipient"]').tab('show');
		}

		//_this.searchContacts('');
		return _this.getCoins(function (error, coins) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			_this.setState({
				coins: _.uniq(_.filter((_this.state.selectedCoin && _this.state.selectedCoin.coin ? [_this.state.selectedCoin].concat(coins) : coins), function (coin) {
					return !coin.held;
				}), function (coin) {
					return coin.coin;
				}),
				isLoading: false,
				page: _this.state.page + 1
			});
			return _this.getCoins(function (error, coins) {
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}

				_this.setState({
					coins: _.uniq(_.filter(_this.state.coins.concat(coins), function (coin) {
						return !coin.held;
					}), function (coin) {
						return coin.coin;
					})
				});
			});
		});
	},
	formatContactResults(contacts) {
		return _.map(_.filter(contacts, function (contact) {
			return (!!contact.email || (!!contact.domain || !!contact.home)) && !!contact.name;
		}), function(contact) {
			return {
				type: contact.email ? 'email' : (contact.domain || (contact.home && contact.home.replace('https://', ''))) ? 'domain' : 'domain',
				value: contact.email || contact.domain || (contact.home && contact.home.replace('https://', '')),
				label: contact.name || contact.email || contact.domain || (contact.home && contact.home.replace('https://', ''))
			}
		})
	},
	componentWillMount() {
		var _this = this,
			localContacts = localStorage.getItem('giveContacts'),
			formattedContacts = localContacts && JSON.parse(localContacts);

		_this.setState({
			localContacts: formattedContacts,
			searchedOption: _this.formatContactResults(formattedContacts)
		});

		//Get contacts from localstorage
		coinContacts(function (error, contacts) {
			if (!!contacts) {
				localStorage.setItem('giveContacts', JSON.stringify(contacts));
				return _this.setState({
					localContacts: contacts,
					searchedOption: _this.formatContactResults(contacts)
				});
			}
		});

	},
	getCoins(next) {
		var _this = this;

		if (_this.props.coin && !_this.props.coin.coin && isUserLoggedIn()) {
			return getWalletCoins('', '-created', _this.state.page, {
				minted: true,
				hidden: true,
				held: false,
				batched: true,
				onsale: false,
				showcase: 'sort',
				user: getUser().id
			}, next);
		}

		return getWalletCoins(_this.props.coin.wallet, '-created', _this.state.page, {
			minted: true,
			hidden: true,
			held: false,
			showcase: 'sort',
			batched: true,
			onsale: false
		}, next);
	},
	selectCoin(event) {
		var _this = this,
			coinId = $('#coinSelectorControls .carousel-item.active').find('.coin-wrapper').attr('data-coin-id'),
			coin = _.find(this.state.coins, function (coin) {
				return coin.coin === parseInt(coinId);
			});

		_this.setState({
			selectedCoin: coin
		});

		if (_this.props.skipRecipientInput && _this.props.recipientData) {
			_this.setState({recipientData: _this.props.recipientData});
			return $('#nav-tab a[href="#nav-message"]').tab('show');
		}
		return $('#nav-tab a[href="#nav-recipient"]').tab('show');
	},
	enterRecipient(event) {
		event.preventDefault();
		var _this = this,
			domainRegex = /^(\w+-?.\b){1}(\.c)?\.kred$/i,
			smsRegex = /([+]?\d{1,2}[.-]?)(\d{3}[.-]?){2}\d{4}/i,
			emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;

		if (_this.state.recipientsData.length > this.state.selectedCoin.coins) {
			return $(document.body).trigger('messenger:show', ['warn', ['You only have', this.state.selectedCoin.coins, this.state.selectedCoin.name, ' Coins to give'].join(' ')]);
		}

		async.each(_this.state.recipientsData, function (item, next) {
			var recipient = item.value,
				isDomain = domainRegex.test(recipient),
				isSms = smsRegex.test(recipient),
				isEmail = emailRegex.test(recipient);

			//Make sure the recipient is either; phone, a domain, twitter handle or email address
			if (isDomain || isSms || isEmail) {
				//Set row types
				return next();
			} else {
				if ((/@/i).test(recipient)) {
					return next(recipient + ' email doesn\'t look right.. Please check and try again.');
				} else if ((/^\+/i).test(recipient)) {
					return next(recipient + ' number doesn\'t look right.. Please check and try again.');
				} else {
					return next(recipient + ' doesn\'t look right.. Please check and try again.');
				}
			}
		}, function (error) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$('#nav-tab a[href="#nav-message"]').tab('show');
		});
	},
	enterMessage(event) {
		event.preventDefault();
		var _this = this,
			$form = $(event.target),
			data = objectifyForm($form.serializeArray()),
			sendPrivate = $form.find('#privateMessage-input').is(':checked') ? 1 : 0,
			wallet,
			domainRegex = /^(\w+-?.\b){1}(\.c)?\.kred$/i,
			smsRegex = /([+]?\d{1,2}[.-]?)(\d{3}[.-]?){2}\d{4}/i,
			emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;
		//if recipient is a domain, look up wallet
		//getWallets(userId)
		//giftCoin(coinId, toWallet, text,
		//else holdCoin(coinId, platform, address, text
		$form.find(':input').addClass('disabled');
		$(document.body).trigger('messenger:show', ['progress', ['Sending', _this.state.selectedCoin.name, 'Coin via Stellar Blockchain..'].join(' ')]);

		search({
			batch: _this.state.selectedCoin.batch,
			user: getUser().id,
			held: false,
			count: _this.state.recipientsData.length,
			onsale: false
		}, function (error, coins) {
			if (error) {
				$(document.body).trigger('messenger:progressStop');
				$form.find(':input').removeClass('disabled');
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			async.eachOf(_this.state.recipientsData, function (recipient, index, next) {
				var isDomain = domainRegex.test(recipient.value),
					isSms = smsRegex.test(recipient.value),
					isEmail = emailRegex.test(recipient.value),
					type = recipient.type || (isDomain ? 'domain' : isSms ? 'sms' : 'email'),
					name = recipient.label,
					address = recipient.value;

				if (isSms && !recipient.value.match(/^\+/)) {
					address = '+' + address;
					name = address;
					recipient.value = address;
					recipient.label = address;
				}

				_this.setState({
					recipientsAddress: _this.state.recipientsAddress.concat(address),
					localContacts: _this.state.localContacts.concat({
						name,
						domain: isDomain ? address : '',
						sms: isSms ? address : '',
						email: isEmail ? address : ''
					})
				});

				return sendSMSEmailCoin(coins[index].coin, type, address, name, data.message, sendPrivate, next);
			}, function (error, res) {
				$(document.body).trigger('messenger:progressStop');
				$form.find(':input').removeClass('disabled');

				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}

				$('#nav-tab a[href="#nav-giver"]').tab('show');
				return $(document.body).trigger('coinAction:done');
			});
		});
	},
	giveAnotherCoin() {
		var _this = this;
		_this.setState({
			selectedCoin: {},
			recipientsData: [],
			recipientsAddress: [],
			recipient: '',
			recipientName: '',
			recipientType: '',
			page: 1
		});
		return _this.getCoins(function (error, coins) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			_this.setState({
				coins: _.uniq(_.filter(coins, function (coin) {
					return !coin.held;
				}), function (coin) {
					return coin.coin;
				}),
				page: _this.state.page + 1
			});
			$('#nav-tab a[href="#nav-choose"]').tab('show');
		});
	},
	giveAnotherCoinToSameUser() {
		var _this = this;
		_this.setState({
			page: 1
		});
		return _this.getCoins(function (error, coins) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			_this.setState({
				coins: _.uniq(_.filter(coins, function (coin) {
					return !coin.held;
				}), function (coin) {
					return coin.coin;
				}),
				page: _this.state.page + 1
			});
			$('#nav-tab a[href="#nav-choose"]').tab('show');
		});
	},
	recipientsChange(tags) {
		this.setState({
			recipientsData: _.unique(_.filter(this.state.recipientsData, function (recipient) {
				return _.find(tags, function (tag) {
					return tag === recipient.label;
				});
			}), function (recipient) {
				return recipient.value;
			})
		});
	},
	handleChange(selectedOption) {
		var _this = this;

		_this.setState({
			recipientsData: selectedOption
		});
	},
	onInputKeyDown(event) {
		var _this = this,
			$input = $(event.target).closest('#react-select-2-input').val();
		switch (event.keyCode) {
			case 9:   // TAB
			case 13: // ENTER
			case 188: // COMMA
				_this.setState({
					recipientsData: _.unique(_this.state.recipientsData.concat({
						value: $input,
						label: $input
					}), function (recipient) {
						return recipient.value;
					})
				});
				$('#nav-recipient #react-select-2-input').val('').trigger('click');
				break;
		}
	},
	isValidNewOption(inputValue, selectValue, selectOptions) {
		return (inputValue.trim().length === 0 || selectOptions.find(option => option.name === inputValue))
	},
	newSearch(inputValue, option) {
		var _this = this;

		if (option.action && option.action == 'input-change') {
			if (inputValue && inputValue.length < 3) {
				return;
			}
			_this.setState({
				page: 1,
				searching: true,
				inputValue: inputValue
			});

			if (timeout) {
				clearTimeout(timeout);
			}
			timeout = setTimeout(function () {
				_this.searchContacts(inputValue);
			}, 500);
		}
	},
	searchContacts(inputValue) {
		var _this = this,
			data = {
				page: 1,
				count: 20
			};

		_this.setState({
			searching: true
		});

		//check if is EK ticket input eg. (e)artee
		if (inputValue.match(/^\(e\)/)) {
			return async.auto({
				'userId': function (next) {
					return getEKTickerUser(inputValue.replace(/^\(e\)/, ''), next);
				},
				'user': ['userId', function (res, next) {
					return user(res.userId, next);
				}]
			}, function (error, res) {
				if (error) {
					return _this.setState({
						searchedOption: [],
						searching: false
					})
				}

				if (!!res.user) {
					//_this.handleChange([{
					//	type: 'email',
					//	value: res.user.email,
					//	label: formatDisplayName(res.user)
					//}]);
					return _this.setState({
						searchedOption: [{
							type: 'email',
							value: res.user.email,
							label: inputValue + ' - ' + formatDisplayName(res.user)
						}],
						searching: false
					});
				}
				return _this.setState({
					searchedOption: _this.formatContactResults(_this.state.localContacts),
					searching: false
				});
			});
		}

		if (inputValue) {
			data.query = inputValue;
		} else {
			data.mode = 'quick';
			data.annotate = false;
		}

		getContacts(data, function (error, contacts) {
			if (error) {
				return _this.setState({
					searchedOption: _this.formatContactResults(_this.state.localContacts),
					searching: false
				})
			}

			_this.setState({
				searchedOption: _this.formatContactResults(contacts.concat(_this.state.localContacts)),
				searching: false
			});
		});
	},
	addRecipientFields(event) {
		var total = this.state.recipientInputCount;
		//Check if reached max coin.coins

		if (total >= this.state.selectedCoin.coins) {
			return $(document.body).trigger('messenger:show', ['warn', ['You only have', this.state.selectedCoin.coins, this.state.selectedCoin.name, ' Coins to give'].join(' ')]);
		}

		this.setState({
			recipientInputCount: total + 1
		});

		$('.giveacoin-modal .recipient-container').append('<div class="form-row"><div class="col">' +
		'<input type="text" class="form-control" name="name" placeholder="Full Name" required/>' +
		'</div><div class="col">' +
		'<input type="text" class="form-control" name="address" placeholder="Phone, email or .Kred" required/>' +
		'<input type="hidden" name="type"/>' +
		'</div>' +
		'<div class="col-1">' +
		'<i class="fas fa-trash delete-recipient-row"></i>' +
		'</div></div>');

		$('.delete-recipient-row').on('click', function (e) {
			$(e.target).closest('.form-row').remove();
		});

	},
	render: function () {
		const {
			coin,
			random1,
			random2,
			history
			} = this.props;
		const {
			isLoading,
			selectedCoin,
			recipientsData,
			recipientsAddress,
			coins,
			searching,
			searchedOption,
			} = this.state;

		return (
			<div className="giveacoin-modal modal fade" tabindex="-1" role="dialog" aria-hidden="true">
				<div className="vertical-alignment-helper">
					<div className="modal-dialog modal-md vertical-align-center">
						<div className="modal-content">
							<nav>
								<div className="nav nav-tabs" id="nav-tab" role="tablist">
									<a className="nav-item hidden active" id="nav-choose-tab" data-toggle="tab" href="#nav-choose" role="tab" aria-controls="nav-choose" aria-selected="false"></a>
									<a className="nav-item hidden" id="nav-recipient-tab" data-toggle="tab" href="#nav-recipient" role="tab" aria-controls="nav-recipient" aria-selected="false"></a>
									<a className="nav-item hidden" id="nav-message-tab" data-toggle="tab" href="#nav-message" role="tab" aria-controls="nav-message" aria-selected="false"></a>
									<a className="nav-item hidden" id="nav-giver-tab" data-toggle="tab" href="#nav-giver" role="tab" aria-controls="nav-giver" aria-selected="false"></a>
									<a className="nav-item hidden" id="nav-already-given-tab" data-toggle="tab" href="#nav-already-given" role="tab" aria-controls="nav-already-given" aria-selected="false"></a>

									<div className="tab-content" id="nav-tabContent" style={{width: '100%'}}>
										<div className="tab-pane fade" id="nav-intro" role="tabpanel" aria-labelledby="nav-intro-tab">
											<div className="modal-header">
												<h5 className="modal-title">Give a Coin</h5>
												<button type="button" className="close" data-dismiss="modal" aria-label="Close">
													<span aria-hidden="true">&times;</span>
												</button>
											</div>
											<div className="modal-body text-center">
												<p>Give coins to friends and family to share a special moment, thanks or gratitude</p>
											</div>
											<div className="modal-footer">
												<a className="btn btn-primary" id="nav-choose-tab" data-toggle="tab" href="#nav-choose" role="tab" aria-controls="nav-choose" aria-selected="false">Next</a>
											</div>
										</div>
										<div className="tab-pane fade show active" id="nav-choose" role="tabpanel" aria-labelledby="nav-choose-tab">
										{!isLoading && (
											!!coins.length ? (
												<div>
													<div className="modal-header">
														<h5 className="modal-title">Give a Coin</h5>
														<button type="button" className="close" data-dismiss="modal" aria-label="Close">
															<span aria-hidden="true">&times;</span>
														</button>
													</div>
													<div className="modal-body text-center">
														<p>Choose a Coin to Give</p>
														<div id="coinSelectorControls" className="carousel slide" data-interval="false">
															<div className="carousel-inner">
															{coins.map((coin, index) => {
																return (
																	<div className={"carousel-item" + ((selectedCoin && selectedCoin.coin ? coin.coin === selectedCoin.coin : index === 0) ? ' active' : '')}>
																		{coin.coins > 1 ? (<span className="badge badge-pill badge-light">{coin.coins} coins</span>) : null}
																		<CoinFrontBack
																			coin={coin}
																			width={300}
																		/>
																	</div>
																)
															})}

															</div>
															<a className="carousel-control-prev" href="#coinSelectorControls" role="button" data-slide="prev">
																<i className="fas fa-angle-left" aria-hidden="true"></i>
																<span className="sr-only">Previous</span>
															</a>
															<a className="carousel-control-next" href="#coinSelectorControls" role="button" data-slide="next">
																<i className="fas fa-angle-right" aria-hidden="true"></i>
																<span className="sr-only">Next</span>
															</a>
														</div>
													</div>
													<div className="modal-footer">
														<button type="button" className="btn btn-primary" onClick={this.selectCoin.bind(this)}>Give</button>
													</div>
												</div>
											) : (
												<div>
													<div className="modal-header">
														<h5 className="modal-title">Give a Coin</h5>
														<button type="button" className="close" data-dismiss="modal" aria-label="Close">
															<span aria-hidden="true">&times;</span>
														</button>
													</div>
													<div className="modal-body text-center">
														<div class="text-center" style={{marginTop: '1em'}}>
															<h2>You don't own any coins yet!</h2>
														</div>
													</div>
												</div>
											)
										)}
										</div>
										<div className="tab-pane fade" id="nav-recipient" role="tabpanel" aria-labelledby="nav-recipient-tab">
											<form onSubmit={this.enterRecipient.bind(this)}>
												<div className="modal-header">
													<h5 className="modal-title">Give my {coin.name} Coin to:</h5>
													<button type="button" className="close" data-dismiss="modal" aria-label="Close">
														<span aria-hidden="true">&times;</span>
													</button>
												</div>
												<div className="modal-body">
													<CreatableSelect
														isMulti
														value={recipientsData}
														placeholder="Enter name, email, phone, ticker or username"
														name="form-field-name"
														onInputChange={this.newSearch}
														onKeyDown={this.onInputKeyDown}
														onChange={this.handleChange}
														options={searchedOption}
														isLoading={searching}
														formatCreateLabel={(input) => "Send to: " + input}
														formatOptionLabel={(option, context)=> {
															return [option.label, option.value].join(' - ');
															}}
														//isDisabled={recipientsData.length >= coin.coins}
														//isValidNewOption={this.isValidNewOption}
													/>

													{recipientsData.length > coin.coins ? (
														<p className="text-danger">
															<small>You can only send {coin.coins} coin{coin.coins > 1 ? 's' : ''} to {coin.coins} friend{coin.coins > 1 ? 's' : ''}</small>
														</p>
													) : null}


												</div>
												<div className="modal-footer">
													<button type="submit" className="btn btn-primary">Next</button>
												</div>
											</form>
										</div>
										<div className="tab-pane fade" id="nav-message" role="tabpanel" aria-labelledby="nav-message-tab">
											<form onSubmit={this.enterMessage.bind(this)}>
												<div className="modal-header">
													<h5 className="modal-title">Give a Coin</h5>
													<button type="button" className="close" data-dismiss="modal" aria-label="Close">
														<span aria-hidden="true">&times;</span>
													</button>
												</div>
												<div className="modal-body text-center">
													<p>Add an optional public message</p>
													<textarea className="form-control" rows="4" name="message" placeholder="Add a message"></textarea>

													<p className="text-left">
														<div class="custom-control custom-checkbox">
															<input type="checkbox" class="custom-control-input" id="privateMessage-input" name="privateMessage"/>
															<label class="custom-control-label" for="privateMessage-input">
																<span>Send as Private Message</span>
															</label>
														</div>
													</p>
												</div>
												<div className="modal-footer">
													<a className="btn btn-outline-secondary pull-left btnPrevious">
														Back
													</a>
													<button type="submit" className="btn btn-primary">Give</button>
												</div>
											</form>
										</div>
										<div className="tab-pane fade" id="nav-giver" role="tabpanel" aria-labelledby="nav-giver-tab">
											<div className="modal-body text-center">
												<button type="button" className="close" data-dismiss="modal" aria-label="Close">
													<span aria-hidden="true">&times;</span>
												</button>
												<h3 style={{marginBottom: '20px'}}>You're a Giver!</h3>
												<CoinFrontBack
													coin={selectedCoin}
													width={300}
												/>
												<p style={{marginTop: '20px'}}>Your Coin is on its way to&nbsp;
													<span>{recipientsAddress.join(', ')}</span>
												</p>
												<p>
													<a data-toggle="modal" data-target="#activityModal">You've earned Kred outreach points</a>
												</p>
											</div>
											<div className="modal-footer">
												<button type="button" className="btn btn-primary" onClick={this.giveAnotherCoin.bind(this)}>Give Another Coin</button>
											</div>
										</div>
										<div className="tab-pane fade" id="nav-already-given" role="tabpanel" aria-labelledby="nav-already-given-tab">
											<div className="modal-body text-center">
												<button type="button" className="close" data-dismiss="modal" aria-label="Close">
													<span aria-hidden="true">&times;</span>
												</button>
												<h3>The {coin.name} Coin has already been sent to {history && history.name}.</h3>
												<br/>
												<CoinFrontBack
													coin={coin}
													width={300}
												/>
											</div>
											<div className="modal-footer">
												<button type="button" className="btn btn-primary" onClick={this.giveAnotherCoinToSameUser.bind(this)}>Give Another Coin</button>
											</div>
										</div>
									</div>
								</div>
							</nav>
						</div>
					</div>
				</div>
			</div>
		)
	}
});

export {
	GiveACoin
	};

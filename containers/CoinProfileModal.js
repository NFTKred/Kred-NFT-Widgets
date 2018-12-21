import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import async from 'async';
import _ from 'underscore';

import '../css/coinProfileModal';

import CoinFrontBack from './CoinFrontBack';
import { CoinImage } from './CoinImage';
import RequestsModal from './RequestsModal';
import CirculationModal from './CirculationModal';
import CoinCommentsSettings from './CoinCommentsSettings';
import {getAvatar, formatDisplayName, round} from '../js/helpers';
import {user, getUser, requireLogin} from '../js/auth';
import {getCoin, getCoinOwners, getFreshRequests, getMarket, likeCoin, unlikeCoin} from '../js/grab';

class CoinProfileModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isOwner: getUser().id === this.props.coin.user,
			coin: this.props.coin,
			creatorUser: {},
			ownerUser: {},
			requests: [],
			history: [],
			market: {},
			liking: false
		};
	}
	componentDidMount() {
		$('.coin-action-modals').on('hidden.bs.modal', function (e) {
			this.remove();
		});
		var _this = this;

		_this.loadData(_this.props);

		$(document.body).on('coinAction:done', function () {
			_this.loadData(_this.props);
		});
	}
	loadData(props) {
		var _this = this;
		const { coin } = props;

		return async.auto({
			'getCoin': function (next) {
				//return getCoin({coin: coin.coin}, next);
				return next(null, coin);
			},
			'history': ['getCoin', function (res, next) {
				return getCoinOwners(res.getCoin.coin, next);
			}],
			'getUser': ['getCoin', function (res, next) {
				return user((res.getCoin.creator || res.getCoin.user), next);
			}],
			'ownerUser': ['getCoin', function (res, next) {
				if (res.getCoin.creator === res.getCoin.user) {
					return next();
				}
				return user((res.getCoin.user), next);
			}],
			'requests': ['getCoin', function (res, next) {
				return getFreshRequests({coin: res.getCoin.coin}, next);
			}],
			'market': ['getCoin', function (res, next) {
				if (res.getCoin && !res.getCoin.auction && !res.getCoin.sale) {
					return next();
				}
				return getMarket({coin: res.getCoin.coin, status: 'active'}, next);
			}]
		}, function (error, res) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			_this.setState({
				//coin: res.getCoin,
				creatorUser: res.getUser,
				ownerUser: res.ownerUser,
				requests: res.requests,
				history: res.history,
				market: _.first(res.market) || {}
			});
		});
	}
	likeOrUnlike(event) {
		var _this = this,
			coinId = _this.props.coin.coin;

		if (_this.props.viewOnly) {
			return;
		}

		if (requireLogin()) {
			return;
		}

		_this.setState({liking: true});

		if (_this.props.coin.liked) {
			return unlikeCoin(coinId, function (error, coin) {
				if (error) {
					_this.setState({liking: false});
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				return getCoin({coin: coin.coin}, function (error, coin) {
					_this.setState({
						liking: false,
						coin: coin
					});

					var $likes = $('.coin-item[data-coin-id="' + coinId + '"]').find('.coin-item-likes');
					$likes.find('.fa-heart').removeClass('liked');
					if (!coin.likes) {
						$likes.find('.coin-item-likes-count').html('');
					} else {
						$likes.find('.coin-item-likes-count').html(' ' + coin.likes);
					}
					//return $(document.body).trigger('coinAction:done');
				});
			});
		} else {
			return likeCoin(coinId, function (error, coin) {
				if (error) {
					_this.setState({liking: false});
					return $(document.body).trigger('messenger:show', ['error', error]);
				}
				return getCoin({coin: coin.coin}, function (error, coin) {
					_this.setState({
						liking: false,
						coin: coin
					});
					var $likes = $('.coin-item[data-coin-id="' + coinId + '"]').find('.coin-item-likes');
					$likes.find('.fa-heart').addClass('liked');
					$likes.find('.coin-item-likes-count').html(' ' + coin.likes);
					//return $(document.body).trigger('coinAction:done');
				});
			});
		}
	}
	viewRequests(event) {
		var _this = this;

		if (_this.props.viewOnly) {
			return;
		}

		const modal = document.createElement('div');
		modal.className = 'coin-action-modals';
		document.body.appendChild(modal);

		ReactDOM.render(<RequestsModal
			loggedInUser={getUser()}
			coin={_this.props.coin}
			requests={_this.state.requests}
		/>, modal);
		$('.requestsmodal-modal').modal('show');
	}
	viewCirculation(event) {
		var _this = this;

		if (_this.props.viewOnly) {
			return;
		}

		const modal = document.createElement('div');
		modal.className = 'coin-action-modals';
		document.body.appendChild(modal);

		ReactDOM.render(<CirculationModal
			loggedInUser={getUser()}
			history={_this.state.history}
			coin={_this.props.coin}
		/>, modal);
		$('.circulationmodal-modal').modal('show');
	}
	closeModal() {
		$('.coinprofile-modal').modal('hide');
		this.props.viewProfile(this.props.coin);
	}
	renderedNewPost() {
	}
	render() {
		const { viewOnly } = this.props;
		const {
			coin,
			isOwner,
			creatorUser,
			ownerUser,
			requests,
			market,
			liking
			} = this.state;

		var coinPrice = (coin.auction || coin.sale) && market ? market.price : coin.value,
			coinFace = coin.face,
			coinBack = coin.back;

		//If Safari and uploaded gif. Use first frame
		if ((coinFace.match(/\.gif$/i) || coin.back.match(/\.gif$/i)) && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
			if (coin.face.match(/imgcdn\.socialos\.io/)) {
				coinFace = coin.face.replace(/\.gif$/, '-frame1.jpg');
			}
			if (coinBack.match(/imgcdn\.socialos\.io/)) {
				coinBack = coin.back.replace(/\.gif$/, '-frame1.jpg');
			}
		}

		return (
			<div className="coinprofile-modal modal fade">
				<div className="vertical-alignment-helper">
					<div className="modal-dialog modal-lg vertical-align-center">
						<div className="modal-content">
							<div className="modal-header">
								<CoinFrontBack
									width={65}
									coin={coin}
								/>
								<h5 className="modal-title">
									<span>{coin.name}</span>
								</h5>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div className="modal-body">
								<div className="row no-gutters body-container">
									<div className="col-sm-6">
								<div id="carouselCoinControls" className="carousel slide" data-interval="false" data-wrap="false">
									<div className="carousel-inner">
										<div className="carousel-item active">
											<CoinImage coin={coin} side="front" className="d-block w-100" alt="Coin - Front Image" />
										</div>
										<div className="carousel-item">
											<CoinImage coin={coin} side="back" className="d-block w-100" alt="Coin - Back Image" />
										</div>

										<a className="carousel-control-prev hidden" href="#carouselCoinControls" role="button" data-slide="prev"
											onClick={()=> $('a[href="#carouselCoinControls"]').toggleClass('hidden')}
										>
											<i className="fas fa-angle-left"></i>
											<span className="sr-only">Previous</span>
										</a>
										<a className="carousel-control-next" href="#carouselCoinControls" role="button" data-slide="next"
											onClick={()=> $('a[href="#carouselCoinControls"]').toggleClass('hidden')}
										>
											<i className="fas fa-angle-right"></i>
											<span className="sr-only">Next</span>
										</a>
											</div>
										</div>
									</div>
									<div className="col-sm-6 coinprofile-comments-container">
										<CoinCommentsSettings {...this.props} coin={coin} isOwner={isOwner} modalPopup={true}/>
									</div>
								</div>
								<div className="row no-gutters">
									<div className="col-sm-6">
										<div className="coinprofile-issuedby">
											<a href={"http://" + coin.domain + "/collection"} target="_blank">
												<div className="issuer-avatar" style={{
													backgroundImage: 'url("' + (creatorUser && getAvatar(creatorUser)) + '"), url("https://d30p8ypma69uhv.cloudfront.net/stream/uploads/53756175b7725d370d9a208f_b91f434779e3f4a5f80d4b2373394d83_defaultAvatar.jpg")'
												}}></div>
												<div className="issuedby-details">
													<p className="text-uppercase">Issued By</p>
													<h4>{formatDisplayName(creatorUser)}</h4>
												</div>
											</a>
										</div>
										{ownerUser && ownerUser.id && (
											<div className="coinprofile-issuedby">
												<a href={"http://" + ownerUser.home + "/collection"} target="_blank">
													<div className="issuer-avatar" style={{
														backgroundImage: 'url("' + (ownerUser && getAvatar(ownerUser)) + '"), url("https://d30p8ypma69uhv.cloudfront.net/stream/uploads/53756175b7725d370d9a208f_b91f434779e3f4a5f80d4b2373394d83_defaultAvatar.jpg")'
													}}></div>
													<div className="issuedby-details">
														<p>Held By</p>
														<h4>{formatDisplayName(ownerUser)}</h4>
													</div>
												</a>
											</div>
										)}
									</div>
									<div className="col-sm-6 coinprofile-widget-header">
										<span>{coinPrice && round(coinPrice, 2)} CƘr</span>
										<span className="divider"></span>
										<span onClick={this.likeOrUnlike.bind(this)}>
											<i className={"fas fa-heart" + (liking ? ' animate-pulse' : '') + (coin.liked ? ' liked' : '')}></i>
										&nbsp;
											<span>{coin.likes || ''}</span>
										</span>
										<span className="divider"></span>
										<span className="circulation-popup" onClick={this.viewCirculation.bind(this)}>
											<i className="fas fa-users"></i>
										&nbsp;{coin.circulation || 1}</span>
											{!!isOwner && !!requests.length && (
												<span>
													<span className="divider"></span>
													<span className="request-popup" onClick={this.viewRequests.bind(this)}>
														<i className="fas fa-hand-holding"></i>
													&nbsp;{requests.length || 0}</span>
												</span>
											)}
											{!viewOnly && (
												<button onClick={() => this.closeModal()} className="btn btn-primary btn-sm">
													More
												</button>
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

export default CoinProfileModal;

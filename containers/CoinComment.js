import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router-dom';
import ReactPlayer from 'react-player';
import _ from 'underscore';

import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';

import CoinCommentActions from './CoinCommentActions';
import ConnectButton from './ConnectButton';
import RequestsModal from './RequestsModal';

import '../css/coinComment'

import lityCss from '../js/vendor/lity/lity.css'
import lity from '../js/vendor/lity/lity.js'

import {getMessages} from '../js/widget';
import {formatDisplayName, getAvatar, getQueryParam} from '../js/helpers';
import { requireLogin, getUser } from '../js/auth';
import { openAsyncModal } from '../js/modal';

const options = {
	decodeEntities: true,
	transform
};

function transform(node, index) {
	// return null to block certain elements
	// don't allow any tags besides <a> elements
	if (node.type === 'tag' && node.name !== 'a') {
		return null;
	}
	//Only allow tags with our URL
	if (node.type === 'tag' && node.name === 'a') {
		if (node.attribs.href && node.attribs.href.match(window.cryptoURL)) {
			return convertNodeToElement(node, index, transform);
		}
		return null;
	}
}

class CoinComments extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: true,
			error: false,
			coinComments: [],
			page: 1,
			commentsLoaded: false,
			hideActions: getQueryParam(location.href, 'hideActions'),
			hideScreenshots: this.props.hideScreenshots || getQueryParam(location.href, 'hideScreenshots')
		};
	}
	componentDidMount() {
		var _this = this;

		_this.getComments(_this.props);

		this._onScroll = () => this.onScroll();
		window.addEventListener('scroll', this._onScroll);

		$(document.body).on('click', '.coinprofile-comments-item .coinprofile-comments-body a', function (event) {
			event.preventDefault();
			var $this = $(event.target),
				isRequest = $this.attr('data-is-request'),
				href = $this.attr('href'),
				messageId = $this.closest('.coinprofile-comments-item').attr('data-message-id');

			// if (isRequest) {
			// 	return _this.viewRequests(messageId);
			// }
			// if (href && href.match(window.cryptoURL)) {
			// 	$('.coinprofile-modal').modal('hide');
			// 	return _this.props.route(href && href.replace(window.cryptoURL, ''));
			// }
			return window.open(href, '_blank');
		});
	}
	viewRequests(messageId) {
		var _this = this;

		if (requireLogin()) {
			return;
		}
		const message = _.find(_this.state.coinComments, function (message) {
			return messageId === message.id;
		});
		if (message) {
			openAsyncModal(
				import(/* webpackChunkName: "RequestsModal" */ './RequestsModal'),
					{
						loggedInUser: getUser(),
						coin: message.data && message.data.coin
					}
				);
		}
	}
	onScroll() {
		var _this = this,
			$container = $('.coinprofile-comments');

		if ($container.scrollTop() + $container.height() >= ($container.height() - 300) && !_this.state.commentsLoaded) {
			if (_this.state.isLoading) {
				return;
			}
			_this.setState({
				page: _this.state.page + 1,
				isLoading: true
			});
			return _this.getComments(_this.props);
		}
	}
	componentWillReceiveProps(nextProps) {
		var _this = this;
		if (nextProps.coin && nextProps.coin.coin !== _this.props.coin.coin) {
			_this.setState({
				coinComments: [],
				page: 1
			});
			_this.getComments(nextProps);
			nextProps.renderedNewPost();
		}
		if (nextProps.reload !== _this.props.reload) {
			_this.setState({
				page: 1
			});
			_this.getComments(nextProps);
		}
		if (!!nextProps.newMessage) {
			_this.getComments(nextProps);
			nextProps.renderedNewPost();
		}
	}
	getComments(props) {
		var _this = this,
			grab = props.grab || props.coin && props.coin.grab;

		_this.setState({
			isLoading: !_this.props.reload || true
		});

		if (!grab || (!!props.coin && !!props.coin.private && (!props.coin.is_member || props.coin.is_banned))) {
			//_this.setState({isLoading: false});
			return;
		}

		var data = {
			count: props.count || 20,
			page: _this.state.page || 1,
		};

		if (props.batchView) {
			data.batch = props.coin.batch;
		} else if (grab) {
			data.grab = grab;
		} else {
			data.coin = props.coin.coin;
		}

		// if (props.isCreator) {
		// 	data.visibility = 'all';
		// }

		getMessages(data, function (error, messages) {
			if (error) {
				return _this.setState({
					error: 'Error: Cannot get messages',
					isLoading: false
				});
			}
			_this.setState({
				coinComments: _.sortBy(_.filter(_.uniq(_this.state.coinComments.concat(messages).reverse() || [], function (message) {
					return message.id;
				}), function (message) {
					return message.type !== 'comment' && (message.text || message.title || message.subject || message.data.title);
				}), function (message) {
					return -message.time;
				}),
				commentsLoaded: messages.length < 20,
				isLoading: false
			});
		});
	}
	rerenderComments() {
		var _this = this;
		_this.setState({
			coinComments: []
		});
		_this.getComments(_this.props);
	}
	onToggleComments() {
		this.setState({
			showComments: !this.state.showComments
		});
	}
	showImage(e) {
		lity($(e.target).attr('src'));
	}
	flagMessage(coin, message) {
		var _this = this;

		openAsyncModal(
			import(/* webpackChunkName: "FlagMessage" */ './FlagMessage'),
				{
					loggedInUser: getUser(),
					message: message,
					coin: coin
				}
			);
	}
	render() {
		const {
			loggedInUser,
			coin,
			newMessage,
			isCreator,
			count,
			grab,
			hasOwned,
			onPostBox,
			onBuy,
			onRequest,
			requestStatus,
			viewOnly
			} = this.props;
		const { isLoading, coinComments, error, hideActions, hideScreenshots } = this.state;
		
		if (error) {
			return <p className="text-danger">{error}</p>
		}

		if (!isLoading) {
			if (!coinComments.length && grab && grab.match(/collection/)) {
				return (
					<div className="coinprofile-comments">
						<div className="text-center" style={{margin: '5em auto'}}>
							<h2>Your Newsfeed is Empty!</h2>
							<p>Here you will see Conversations and Notifications from Coins
								<br/>
								in your Collection. Buy or create a Coin to get started.</p>
							<Link className="btn btn-primary btn-sm" to={"/marketplace"} title="See coins for Sale">
								See coins for Sale
							</Link>
						</div>
					</div>
				);
			} else if (!coinComments.length && !grab && hasOwned) {
				return (
					<div className="coinprofile-comments">
						<div className="text-center">
							<p>Be the first to Comment on the {coin.name} Coin!</p>
							<button className="btn btn-primary btn-sm" onClick={() => onPostBox()}>Add Comment</button>
						</div>
					</div>
				);
			} else if (!coinComments.length && !grab && !hasOwned && !coin.auction && !coin.sale) {
				return (
					<div className="coinprofile-comments">
						<div className="text-center">
							<p>Request the {coin.name} Coin to add a Comment</p>
							<button className={"btn btn-primary btn-sm request-btn" + (requestStatus === 'Requested' ? " disabled" : '')} onClick={onRequest}>{requestStatus}</button>
						</div>
					</div>
				);
			} else if (!coinComments.length && !grab && !hasOwned && (!!coin.auction || !!coin.sale)) {
				return (
					<div className="coinprofile-comments">
						<div className="text-center">
							<p>Buy the {coin.name} Coin to add a Comment</p>
							<button className="btn btn-primary btn-sm" onClick={onBuy}>Buy</button>
						</div>
					</div>
				);
			} else if (coin && coin.private && !coin.is_member) {
				if (coin.auction || coin.sale) {
					return (
						<div className="coinprofile-comments">
							<div className="text-center">
								<p>Comments on the {coin.name} Coin are Private. Buy to gain access.</p>
								<button className="btn btn-primary btn-sm" onClick={onBuy}>Buy</button>
							</div>
						</div>
					);
				} else {
					return (
						<div className="coinprofile-comments">
							<div className="text-center">
								<p>Comments on the {coin.name} Coin are Private. Request to gain access.</p>
								<button className={"btn btn-primary btn-sm" + (requestStatus === 'Requested' ? " disabled" : '')} onClick={onRequest}>{requestStatus}</button>
							</div>
						</div>
					);
				}
			}
		}

		return (
			<div className="coinprofile-comments">
					{coinComments.map(message => {
						var youtubeAndVimeoRegex = /(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/i,
							video = message.text && youtubeAndVimeoRegex.exec(message.text) && youtubeAndVimeoRegex.exec(message.text)[0],
							isCommentOwner = message.user && message.user.id === loggedInUser.id,
							coin = coin || message.data && message.data.coin,
							timeArr = message.ago.split(" "),
							timeString = timeArr[0] + timeArr[1].charAt(0),
							isOwner = loggedInUser.id === (coin && coin.user),
							isRequest = message.text && message.text.match(/^Requested./),
							linkFixedText = message.text && message.text.replace(/href="https:\/\/app\.coin\.kred/, 'href="' + window.cryptoURL);

						//check if buy message - if so and message belongs to logged in user, remove ?buy=1 from url and 'Buy it now.' with 'View coin.'
						if (isCommentOwner && linkFixedText.match(/\?buy=1/)) {
							linkFixedText = linkFixedText.replace(/\?buy=1/, '').replace('Buy it now.', 'View the coin.');
						}

						return (<div className="coinprofile-comments-item" data-message-id={message.id} data-is-request={!!isRequest}>
							<div className="row no-gutters">
								<div className="col-2 col-sm-1">
									<a className="round-avatar" href={message.user.data.profile_url ? (message.user.data.profile_url + '/collection') :
										message.is_twitter && message.at_name ? 'https://twitter.com/' + message.at_name :
										message.is_empire ? 'https://empire.kred/' + messsage.at_name : 'http://' + message.at_name + '.kred/collection' }
										target="_blank"
										style={{
											backgroundImage: "url('" + (getAvatar(message.user) || message.avatar) + "'), url('https://d30p8ypma69uhv.cloudfront.net/stream/uploads/53756175b7725d370d9a208f_b91f434779e3f4a5f80d4b2373394d83_defaultAvatar.jpg')"
										}}>
									</a>
								</div>
								<div className="col-10 col-sm-11">
									<div className="row">
										<div className="col-auto">
											<p className="coinprofile-comments-author">
												<strong>{formatDisplayName(message.user) || message.screen_name}</strong>
											</p>
											<div className="coinprofile-comments-connect-buttons">
										{!!hasOwned && !isCommentOwner && !!loggedInUser.id && (<ConnectButton user={message.user} icon={true}/>)}
											</div>
										</div>
										<div className="col text-right">
											<p className="coinprofile-comments-time">{timeString}</p>
											{!hideActions && !viewOnly ? (
												<div class="flagmessage-container" onClick={() => this.flagMessage(coin, message)}>
													<i className="far fa-flag"></i></div>
											) : null}
											</div>
									</div>
									<div className="col">
										<h3 className="coinprofile-comments-title">{message.subject || message.data.title}</h3>
										<p className="coinprofile-comments-body">{ReactHtmlParser(linkFixedText, options)}</p>
										{!_.isEmpty(message.media) && !hideScreenshots && (
											<img className="coinprofile-comments-media" src={message.media[0] && message.media[0].url} onClick={(e) => this.showImage(e)}/>
										)}
								{video && (
									<div className='player-wrapper'>
										<ReactPlayer
											className='react-player'
											url={video}
											width='100%'
											height='100%'
											autoplay={false}
										/>
									</div>
								)}
								{!!message.card && !!message.cardUrl && !message.media && (
									<div className="embed-og row">
										{message.card && message.card.image && (
											<div className="col-4">
												<img src={message.card.image} className="img-responsive"/>
											</div>
										)}
										<div className="col">
											{message.card.name && (
												<h4>{message.card.name}</h4>
											)}
											{message.card.title && (
												<p>
													<strong>{message.card.title}</strong>
												</p>
											)}
											{message.card.description && (
												<p>{message.card.description}</p>
											)}
											{message.card.url && (
												<a href={message.card.url} target="_blank">{message.card.url}</a>
											)}
										</div>
									</div>
								)}
									</div>
								</div>
							</div>
							{(!!grab || (hasOwned && coin && !!coin.is_member && !coin.is_banned)) && !isRequest && !hideActions ? (
								<CoinCommentActions {...this.props}
									hasOwned={hasOwned}
									isCreator={isCreator}
									message={message}
									rerenderComments={this.rerenderComments.bind(this)}/>
							) : null}
						</div>
						);
					})
						}
				{/*!!coinComments.length && !grab && (hasOwned && coin && !!coin.is_member && !coin.is_banned) && (
					<div className="addcomment-container text-center">
						<button className="btn btn-primary btn-sm" onClick={() => onPostBox()}>Add Post</button>
					</div>
				)*/}
			</div>
		)
	}
}

export default CoinComments;

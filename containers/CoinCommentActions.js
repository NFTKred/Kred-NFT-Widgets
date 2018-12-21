import React, { Component } from 'react';
import _ from 'underscore';
import * as widget from '../js/widget';
import {formatDisplayName, getAvatar} from '../js/helpers';
import { requireLogin } from '../js/auth';
import { errorNotification } from '../js/notification';

class CoinCommentActions extends Component {
	constructor(props) {
		super(props);

		this.state = {
			likes: this.props.message.likes,
			liked: this.props.message.liked,
			liking: false,
			deleting: false,
			moderating: false,
			isLoading: false,
			comments: []
		};
	}
	componentDidMount() {
		if (this.props.message && this.props.message.comments) {
			this.getComments(true);
		}
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.message) {
			this.getComments(true);
		}
	}
	getComments(initLoad) {
		if (!this.props.loggedInUser.id) {
			return;
		}
		//get comments
		var _this = this;
		widget.getComments(_this.props.message.id, function (error, res) {
			if (error) {
				_this.setState({
					showComments: initLoad ? res && res.messages && !!res.messages.length : _this.state.showComments
				});
				return;
			}
			_this.setState({
				comments: _.uniq(_.compact(res && res.messages), function (message) {
					return message.id;
				}) || [],
				showComments: initLoad ? res && res.messages && !!res.messages.length : _this.state.showComments
			});
		})
	}
	onLikeOrUnlikeComment() {
		var _this = this;
		if (requireLogin()) {
			return;
		}
		_this.setState({liking: true});
		widget.onLikeOrUnlikeComment((_this.props.coin && _this.props.coin.coin || _this.props.message.data && _this.props.message.data.coin && _this.props.message.data.coin.coin), this.props.message.id, _this.state.liked, function (error, response) {
			_this.setState({
				liking: false
			});
			if (error) {
				return errorNotification(error);
			}
			_this.setState({
				liked: response && response.parent ? true : false,
				likes: response && response.likes && response.likes.length || 0
			});
		});
	}
	onToggleComments() {
		if (requireLogin()) {
			return;
		}
		this.setState({
			showComments: !this.state.showComments
		});

		this.getComments(false);
	}
	onDeletePost() {
		var _this = this;

		if (requireLogin()) {
			return;
		}

		_this.setState({deleting: true});

		widget.onDeleteComment((_this.props.coin && _this.props.coin.coin || _this.props.message.data && _this.props.message.data.coin && _this.props.message.data.coin.coin), _this.props.message.id, function (error, response) {
			_this.setState({
				deleting: false
			});
			if (error) {
				return errorNotification(error);
			}
			_this.setState({
				liked: response && response.parent ? true : false,
				likes: response && response.likes && response.likes.length || 0
			});
			$('.coinprofile-comments-item[data-message-id="' + _this.props.message.id + '"]').remove();
			_this.props.rerenderComments();
		});
	}
	onModeratePost() {
		var _this = this;
		_this.setState({moderating: true});

		widget.onModerate((_this.props.coin && _this.props.coin.coin || _this.props.message.data && _this.props.message.data.coin && _this.props.message.data.coin.coin), {
			message: _this.props.message.id,
			action: _this.props.message.visibility === 'hidden' ? 'show' : 'hide'
		}, function (error, response) {
			_this.setState({
				moderating: false
			});
			if (error) {
				return errorNotification(error);
			}
			$('.coinprofile-comments-item[data-message-id="' + _this.props.message.id + '"]');
		});
	}
	onDeleteComment(_this, message) {
		var $comment = $('.coinprofile-comments-item[data-message-id="' + message.id + '"]');

		if (requireLogin()) {
			return;
		}

		$comment.find('i.fa-trash').addClass('animate-pulse');

		widget.onDeleteComment(message.data && message.data.coin && message.data.coin.coin, message.id, function (error, response) {
			if (error) {
				return errorNotification(error);
			}
			_this.props.rerenderComments();
		});
	}
	handleSubmit(event) {
		event.preventDefault();
		var _this = this,
			$comment = $(this.refs.comments),
			text = $comment.find('#commentText').val();

		if (requireLogin()) {
			return;
		}

		_this.setState({isLoading: true});

		widget.comment((_this.props.coin && _this.props.coin.coin || _this.props.message.data && _this.props.message.data.coin && _this.props.message.data.coin.coin), this.props.message.id, text, function (error, response) {
			$comment.find('#commentText').val(null);
			if (error) {
				_this.setState({
					isLoading: false,
					showComments: false
				});
				return errorNotification(error);
			}
			_this.getComments();
			_this.setState({
				isLoading: false,
				showComments: true
			});
		});
	}
	render() {
		const {
			message,
			isCreator,
			loggedInUser
			} = this.props;
		const {
			liked,
			likes,
			liking,
			deleting,
			moderating,
			comments,
			isLoading,
			showComments
			} = this.state;

		const messageOwner = loggedInUser.id === (message.user && message.user.id),
			hasOwned = this.props.hasOwned || true;

		return (
			<div className="coinprofile-comments-actions">
				<div className="row">
					<div className="offset-2 col-3 offset-sm-1 col-sm-auto">
						<span onClick={this.onLikeOrUnlikeComment.bind(this)}>
							<i className={"fas fa-heart" + (liking ? ' animate-pulse' : '') + (!!liked ? ' liked' : '')}></i> {likes || ''}</span>
					</div>
					<div className="col-3 col-sm-auto">
						<span onClick={this.onToggleComments.bind(this)}>
							<i className="fas fa-comment"></i> {comments.length || message.comments || ''}</span>
					</div>
					{!!messageOwner && (
						<div className="col-2 col-sm-auto">
							<span onClick={this.onDeletePost.bind(this)}>
								<i className={"fas fa-trash" + (deleting ? ' animate-pulse' : '')}></i>
							</span>
						</div>)}
					{!!isCreator && (
						<div className="col-2 col-sm-auto">
							<span onClick={this.onModeratePost.bind(this)}>
								<i className={"fas fa-eye-slash" + (moderating ? ' animate-pulse' : '') + (message.visibility === 'hidden' ? ' hidden-message' : '')}></i>
							</span>
						</div>)}
				</div>

				<div ref="comments" className="coinprofile-comments-overflow"
					style={showComments ? {height: 'auto'} : {height: 0}}>
					<div className="coinprofile-comments-item-container">
					{comments.map(message => {
							const commentOwner = loggedInUser.id === (message.user && message.user.id),
								timeArr = message.ago.split(" "),
								timeString = timeArr[0] + timeArr[1].charAt(0);

							return (<div className="coinprofile-comments-item" data-message-id={message.id}>
								<div className="row no-gutters">
									<div className="col-auto">
										<a className="round-avatar" href={message.user.data.profile_url ? (message.user.data.profile_url + '/collection') :
											message.is_twitter && message.at_name ? 'https://twitter.com/' + message.at_name :
												message.is_empire ? 'https://empire.kred/' + messsage.at_name : 'http://' + message.at_name + '.kred/collection' }
											target="_blank"
											style={{
												backgroundImage: "url('" + (getAvatar(message.user) || message.avatar) + "'), url('https://d30p8ypma69uhv.cloudfront.net/stream/uploads/53756175b7725d370d9a208f_b91f434779e3f4a5f80d4b2373394d83_defaultAvatar.jpg')"
											}}>
										</a>
									</div>
									<div className="col">
										<div className="row">
											<div className="col-auto">
												<p className="coinprofile-comments-author">
													<strong>{formatDisplayName(message.user) || message.screen_name}</strong>
												</p>
											</div>
											<div className="col text-right">
												<p className="coinprofile-comments-time">{timeString}</p>
											</div>
										</div>
										<div className="col">
											<p className="coinprofile-comments-body" dangerouslySetInnerHTML={{__html: message.text}}></p>
										</div>
										<div className="row" style={{marginTop: '10px'}}>
											<div className="col">
												{!!commentOwner && (<span onClick={() => this.onDeleteComment(this, message)}>
													<i className="fas fa-trash"></i>
												</span>)}
											</div>
										</div>
									</div>
								</div>
							</div>)
						}
					)}

					{hasOwned ? <form onSubmit={this.handleSubmit.bind(this)} data-loading={isLoading ? '1' : '0'}>
						<div className="loading-spinner text-center">
							<i className="fas fa-refresh fa-spin"></i>
							Posting Comment
						</div>
						<div className="comment-form-data">
							<div className="form-group">
								<textarea id="commentText" name="commentText" className="form-control" rows="3" placeholder="Write a Comment.."></textarea>
							</div>
							<div className="text-right">
								<button type="submit" className="btn btn-primary btn-sm">Comment</button>
							</div>
						</div>
					</form> : null}
					</div>
				</div>
			</div>
		)
	}
}

export default CoinCommentActions;
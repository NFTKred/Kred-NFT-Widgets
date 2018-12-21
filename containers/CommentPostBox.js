import React, { Component } from 'react';
import {objectifyForm, upload} from '../js/helpers';
import {postMessage} from '../js/widget';

class CommentPostBox extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	attachImage(event) {
		event.preventDefault();
		var file = document.getElementById("postAttachmentFile").files[0],
			fileExt = $(event.target).val().split('.').pop().toLowerCase(),
			$postBox = $(event.target).closest('.commentpostbox-modal');

		if ($.inArray(file.type, ['image/gif', 'image/png', 'image/jpeg']) === -1) {
			return alert('Invalid file!');
		}

		var reader = new FileReader();
		reader.onloadend = function () {
			$postBox.find('.writePost-attach-filenameContainer').show().css({
				display: 'inline-block',
				width: '90%',
				overflow: 'hidden',
				'padding-right': '15px',
				'padding-left': '15px'
			});
			$postBox.find('.writePost-attach-filenameContainer .post_processing').show();
			upload(file.name, reader.result, function (error, uploadData) {
				console.log('upload:', uploadData.url);

				$postBox.find('.writePost-attach-filenameContainer .post_processing').hide();
				$postBox.find('#postMediaUrl').val(uploadData.url);
				$postBox.find('.post_file_name').html(uploadData.url);
				return;
			});
		};

		if (file) {
			reader.readAsDataURL(file);
		}
	}
	postComment(event) {
		event.preventDefault();
		if (this.props.coin && !this.props.coin.grab) {
			return $(document.body).trigger('messenger:show', ['error', 'This Coin doesn\'t have a Grab']);
		}
		var _this = this,
			$postBox = $(event.target).closest('.commentpostbox-modal'),
			$form = $(event.target),
			values = objectifyForm($form.serializeArray()),
			data = {
				text: values.postInput,
				subject: values.title,
				coin: _this.props.coin.coin
			},
			tags = $form.find('.addTags-input').val(),
			media = values.postMediaUrl;

		if (tags) {
			data.tags = tags;
		}

		if (media) {
			data.media = media;
		}
		$form.find(':input').prop('disabled', true);
		postMessage(data, function (error, response) {
			$form.find(':input').prop('disabled', false);
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$form[0].reset();
			$postBox.find('.writePost-attach-filenameContainer').hide().removeAttr('css');

			$postBox.find('#postMediaUrl').val(null);
			$postBox.find('.post_file_name').html(null);

			if (_this.props.modalPopup) {
				$('.commentpostbox-modal').removeClass('show').hide();
			} else {
				$('.commentpostbox-modal').modal('hide');
			}
			_this.props.hasNewPost();
		});
	}
	closeModal(event) {
		if (this.props.modalPopup) {
			event.preventDefault();
			$('.commentpostbox-modal').removeClass('show').hide();
		} else {
			$('.commentpostbox-modal').modal('hide');
		}
	}
	render() {
		const { coin } = this.props;
		return (
			<div className="commentpostbox-modal modal fade" tabindex="-1" role="dialog" aria-hidden="true">
				<div className="vertical-alignment-helper">
					<div className="modal-dialog modal-md vertical-align-center">
						<div className="modal-content">
							<form className="commentpostbox-posting-form" onSubmit={this.postComment.bind(this)}>
								<div className="modal-header">
									<h5 className="modal-title">Post a Comment</h5>
									<button type="button" className="close" onClick={(event) => this.closeModal(event)}>
										<span aria-hidden="true">&times;</span>
									</button>
								</div>
								<div className="modal-body">
									<div className="post-input-container">
										<div className="form-group">
											<label for="title">Title</label>
											<input id="title" type="text" name="title" className="form-control postTitle" placeholder="Add a Title to your Post"/>
										</div>
										<div className="form-group">
											<label for="postInput" className="writepost-label-post">Post*</label>
											<textarea required id="postInput" name="postInput" className="form-control" placeholder="Write a Post" rows="3"></textarea>
										</div>
									</div>

									<div className="app_widgets_writePost-fileAttachContainer" data-loading="0" data-uploaded="0">
										<div className="row">
											<div className="col-xs-1 text-center">
												<label title="Attach images and files" className="writePost-attach">
													<i className="fas fa-lg fa-paperclip"></i>
													<input type="file" id="postAttachmentFile" name="postAttachment" onChange={(e) => this.attachImage(e)}/>
													<input type="hidden" id="postMediaUrl" name="postMediaUrl" />
												</label>
											</div>
											<div className="writePost-attach-filenameContainer" style={{display: "none"}}>
												<div className="post_processing">
													<i className="fas fa-refresh fa-spin"></i>
													Processing File Upload.
												</div>
												<div className="post_file_detail">
													<p className="post_file_name"></p>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="modal-footer">
									<button type="submit" className="btn btn-primary btn-sm">Post</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default CommentPostBox;

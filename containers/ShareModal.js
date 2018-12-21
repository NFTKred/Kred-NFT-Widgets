import React from 'react';
import ReactDOM from 'react-dom';

import '../css/shareModal.css';

const ShareModal = React.createClass({
	getInitialState() {
		return {};
	},
	render: function () {
		const {
			text,
			url
			} = this.props;

		var defaultUrl = location.href;
		var twitter_share =
			'//twitter.com/intent/tweet?' +
			$.param({url: url || defaultUrl, text: text});
		var facebook_share =
			'https://facebook.com/sharer/sharer.php?' + $.param({u: url || defaultUrl});
		var linkedin_share =
			'//www.linkedin.com/shareArticle?' +
			$.param({url: url || defaultUrl, title: text, mini: true});

		return (
			<div className="shareModal-modal modal fade">
				<div className="vertical-alignment-helper">
					<div className="modal-dialog vertical-align-center">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" style="position: absolute; right: 10px;">&times;</button>
								<h4 className="modal-title">Share Links</h4>
							</div>
							<div className="modal-body text-center">
								<a href={twitter_share} target="_blank"><i className="fab fa-twitter fa-3x"></i></a>
								<a href={facebook_share} target="_blank"><i className="fab fa-facebook-f fa-3x"></i></a>
								<a href={linkedin_share} target="_blank"><i className="fab fa-linkedin-in fa-3x"></i></a>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
});

export default ShareModal;
export function openShareModal(props) {
	const sharemodal = document.createElement('div');
	sharemodal.className = 'coin-action-modals';
	document.body.appendChild(sharemodal);

	ReactDOM.render(
		<ShareModal {...props} />,
		sharemodal
	);

	$('.shareModal-modal').modal('show');
}
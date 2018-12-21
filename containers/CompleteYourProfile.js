import React from 'react';
import ReactDOM from 'react-dom';
import async from 'async';
import _ from 'underscore';

export const CompleteYourProfile = React.createClass({
	getInitialState() {
		return {};
	},
	componentDidMount() {
		var _this = this;

		$('.completeYourProfile-modal .close, .completeyourprofile-container .modal-backdrop').click(function () {
			$('.completeyourprofile-container').addClass('hide');
			$('.coin-action-modals').remove();
		});
	},
	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.show !== this.props.show;
	},
	render: function () {
		const {
			loggedInUser,
			} = this.props;

		return (
			<div className="completeyourprofile-container" style={{
				position: 'absolute',
				top: '5em',
				left: 'calc(50% - 298px)',
				zIndex: '9999'
			}}>
				<iframe scrolling="no" src={"https://app.crypto.kred/profile/completeYourProfile?domain=" + loggedInUser.home}
					style={{
						border: '0px none',
						height: '859px',
						width: '595px',
						margin: 'auto',
						zIndex: '9999',
						position: 'absolute',
						borderRadius: '10px'
					}}></iframe>
				<div className="modal-backdrop fade in"></div>
			</div>

		)
	}
});

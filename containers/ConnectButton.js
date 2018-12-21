import React, { Component } from 'react';
import {checkConnected, connect} from '../js/grab';

class ConnectButton extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isConnected: false,
			checked: false
		};
	}
	componentDidMount() {
		var _this = this,
			userId = this.props.user.id;

		checkConnected(userId, function (error, res) {
			if (error) {
				return;
			}
			_this.setState({
				isConnected: res.connections.length && res.connections[0].stage || false,
				checked: true
			});
		});
	}
	connect() {

		var _this = this,
			userId = this.props.user.id;

		connect(userId, function (error, res) {
			if (error) {
				return;
			}
			_this.setState({
				isConnected: 'request'
			});
			if (!_this.props.icon) {
				$('.user-connect-btn[data-user-id="' + userId + '"]')
					.replaceWith('<button type="button" className="btn btn-outline-secondary btn-sm disabled">Requested</button>');
			} else {
				$('.user-connect-btn[data-user-id="' + userId + '"]')
					.replaceWith('<i className="fas fa-user-plus requested-icon" title="Requested"></i>');
				$(document.body).trigger('messenger:show', ['message', 'Connection Request Sent.']);
			}
		});
	}
	render() {
		const {
			user,
			icon
			} = this.props;
		const {
			isConnected,
			checked} = this.state;

		if (!checked) {
			return;
		}

		if (icon) {
			if (isConnected === 'confirmed') {
				return (<i className="fas fa-check" title="Connected"></i>);
			} else if (isConnected === 'request') {
				return (<i className="fas fa-user-plus requested-icon" title="Requested"></i>);
			} else {
				return (<i className="fas fa-user-plus user-connect-btn" data-user-id={user.id} onClick={this.connect.bind(this)} title="Connect"></i>);
			}
		}

		if (isConnected === 'confirmed') {
			return (<button type="button" className="btn btn-outline-secondary btn-sm disabled">Connected</button>);
		} else if (isConnected === 'request') {
			return (<button type="button" className="btn btn-outline-secondary btn-sm disabled">Requested</button>);
		} else {
			return (<button type="button" data-user-id={user.id} className="btn btn-primary btn-sm user-connect-btn" onClick={this.connect.bind(this)}>Connect</button>);
		}
	}
}

export default ConnectButton;
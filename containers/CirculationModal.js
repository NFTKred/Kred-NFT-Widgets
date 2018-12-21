import React, { Component } from 'react';
import _ from 'underscore';

import '../css/circulationModal.css';
import ConnectButton from './ConnectButton';
import { getAvatar } from '../js/helpers';
import {getCoinOwners} from '../js/grab';

class Circulation extends Component {
	constructor(props) {
		super(props);

		this.state = {
			history: this.props.history
		};
	}
	componentDidMount() {
		$('.coin-action-modals').on('hidden.bs.modal', function (e) {
			this.remove();
		});
	}
	componentWillMount() {
		var _this = this;

		if (_this.state.history) {
			return;
		}

		return getCoinOwners(_this.props.coin.coin, function (error, history) {
			_this.setState({
				history: history
			})
		});
	}
	render() {
		const {
			loggedInUser,
			coin
			} = this.props;

		const { history } = this.state;

		var historyList = _.filter(history, function (history) {
			return !!history.name;
		}), hasTouched = _.find(historyList, function (history) {
			return history.user === loggedInUser.id;
		});

		return (
			<div className="circulationmodal-modal modal fade" tabindex="-1" role="dialog" aria-hidden="true">
				<div className="vertical-alignment-helper">
					<div className="modal-dialog modal-md vertical-align-center">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Circulation</h5>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>

							<div className="modal-body">
							{historyList.map((history) => {
								const name = history.name,
									avatar = getAvatar(history.to) || history.avatar || 'https://d30p8ypma69uhv.cloudfront.net/stream/uploads/53756175b7725d370d9a208f_b91f434779e3f4a5f80d4b2373394d83_defaultAvatar.jpg',
									isLoggedInUser = history.user === loggedInUser.id;

								return (<div className="row circulation-item">
									<div className="col-auto">
										<a>
											<img className="circulation-item-avatar" src={avatar} alt={name}
												onError="this.onerror=null;this.src='https://d30p8ypma69uhv.cloudfront.net/stream/uploads/53756175b7725d370d9a208f_b91f434779e3f4a5f80d4b2373394d83_defaultAvatar.jpg'"
											/>
										</a>
										<p className="circulation-item-author" title={name}>{name}</p>
									</div>
									<div className="col text-right">
										{/* ONLY SHOW connect if;
										 - user is not logged user
										 - has previously owned the own
										 - if logged in*/}
										{!isLoggedInUser && !!hasTouched && !!loggedInUser.id && (<ConnectButton user={{id: history.user}}/>)}
									</div>
								</div>);
							})}
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default Circulation;
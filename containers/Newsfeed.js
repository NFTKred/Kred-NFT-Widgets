import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {withRouter, Link} from 'react-router-dom';

import _ from 'underscore';
import '../css/newsfeed'
import CoinComment from './CoinComment';
import Leaderboard from './Leaderboard';

import {checkIfMobile} from '../js/helpers';
import { requireLogin } from '../js/auth';

const Newsfeed = React.createClass({
	getInitialState() {
		return {
			reloadNewsfeed: ''
		};
	},
	componentDidMount() {
		var _this = this;
		if (requireLogin()) {
			return;
		}
	},
	route(url) {
		this.props.history.push(url);
	},
	onSignup() {
		if (requireLogin()) {
			return;
		}
	},
	reloadNewsfeed() {
		var _this = this;
		setTimeout(function () {
			_this.setState({
				reloadNewsfeed: _.random(1, 999)
			})
		}, 1000);
	},
	render: function () {
		const {loggedInUser} = this.props;
		const {reloadNewsfeed} = this.state;

		if (!loggedInUser) {
			return (<div className="text-center" style={{margin: '5em auto'}}>
				<h2>View your Newsfeed!</h2>
				<p>Here you will see Conversations and Notifications from Coins
					<br/>
					in your Collection. Sign up to get started.</p>
				<button type="button" className="btn btn-primary btn-sm" onClick={() => this.onSignup()}>Sign up</button>
			</div>);
		}

		return (
			<div className="newsfeed-container">
				<div className="newsfeed-tabs-container">
					<div className="tab-content" id="newsfeedTabsContent">
						<div className="tab-pane fade show active" id="newsfeed" role="tabpanel" aria-labelledby="newsfeed-tab">
						{checkIfMobile() ? (
							<div>
								<div className="nav page-toggle btn-group newsfeed-tabs" id="newsfeedTabs" role="tablist">
									<a className="nav-item nav-link btn btn-primary active show" id="feed-tab"
										data-toggle="tab" href="#feed" role="tab" aria-controls="feed" aria-selected="false">Feed</a>
									<a className="nav-item nav-link btn btn-primary" id="circulation-tab"
										data-toggle="tab" href="#circulation" role="tab" aria-controls="circulation" aria-selected="false">Circulation</a>
								</div>
								<div className="tab-content" id="newsfeedTabsContent">
									<div className="tab-pane fade show active" id="feed" role="tabpanel" aria-labelledby="feed-tab">
										<CoinComment {...this.props} route={this.route} reload={reloadNewsfeed} hasOwned={true} grab={'collection.' + loggedInUser.id + '.grab'}/>
									</div>
									<div className="tab-pane fade" id="circulation" role="tabpanel" aria-labelledby="circulation-tab">
										<Leaderboard {...this.props}/>
									</div>
								</div>
							</div>
						) : (
							<div className="row">
								<div className="col-sm-8">
									<CoinComment {...this.props} reload={reloadNewsfeed} route={this.route} hasOwned={true} grab={'collection.' + loggedInUser.id + '.grab'}/>
								</div>
								<div className="col-sm-4">
									<Leaderboard {...this.props}/>
								</div>
							</div>
						)}

						</div>
					</div>
				</div>

			</div>
		)
	}
});

Newsfeed.propTypes = {
	history: PropTypes.shape({
		push: PropTypes.func.isRequired
	})
};

export default withRouter(Newsfeed);
import React from 'react';
import ReactDOM from 'react-dom';
import '../css/newsfeed'
import CoinComment from './CoinComment';

const GlobalFeed = React.createClass({
	getInitialState() {
		return {};
	},
	componentDidMount() {
		var _this = this;

	},
	render: function () {
		const {grabName} = this.props;

		return (
			<div className="globalFeed-container">
				<CoinComment {...this.props} grab={grabName || "everything.ck.grab"}/>
			</div>
		)
	}
});

export default GlobalFeed;
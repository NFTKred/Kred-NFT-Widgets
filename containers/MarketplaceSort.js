import React from 'react';
import _ from 'underscore';

import MarketplaceTabs from './Marketplace/Tabs';
import { PopularSearches } from './PopularSearches';
import Coins from './Coins';
import { BackButton } from './BackButton';

import {search} from '../js/grab';
import {checkIfMobile} from '../js/helpers';

var sortCategories = [{
	id: 1,
	title: 'Popular',
	type: 'sort',
	value: '-likes'
}, {
	id: 2,
	title: 'Recently Minted',
	type: 'sort',
	value: '-created'
}, {
	id: 3,
	title: 'Most Circulated',
	type: 'sort',
	value: '-circulation'
}], typewatch = function () {
	var timer = 0;
	return function (callback, ms) {
		clearTimeout(timer);
		timer = setTimeout(callback, ms);
	}
}(), isLoading = false;

const MarketplaceSort = React.createClass({
	getInitialState() {
		return {
			isLoading: true,
			isSearching: false,
			userId: '',
			isOwner: false,
			search: '',
			tab: 'all-tab',
			allCoins: [],
			allCoinsLoaded: false,
			allPage: 1,
			allSort: this.props.sort || '-created',
			tagTerm: this.props.tags || '',
			isMobile: checkIfMobile(),
			onScroll: this.onScroll.bind(this)
		};
	},
	getCoins(callback) {
		var _this = this;

		return search({
			page: _this.state.allPage,
			sort: _this.state.allSort,
			status: 'active',
			search: _this.state.search,
			batched: true,
			tag: _this.state.tagTerm || '',
			any_tag: '',
			domain: _this.state.tagTerm && _this.props.domain ? _this.props.domain : '',
			showcase: 'sort'
		}, callback);
	},
	componentWillUnmount() {
		window.removeEventListener('scroll', this.onScroll, false);
	},
	componentDidMount: function () {
		var _this = this;
		$(document.body).on('coinAction:done', function () {
			_this.renderCoins();
		});
		this.renderCoins();
		window.addEventListener('scroll', _this.onScroll, false);
		window.addEventListener('resize', _this.resize);
	},
	resize() {
		this.setState({
			isMobile: checkIfMobile()
		});
	},
	onScroll(event) {
		var _this = this;

		if ($(window).scrollTop() + $(window).height() >= ($(document).height() - 450)) {
			if (isLoading) {
				return;
			}
			isLoading = true;

			if (_this.state.allCoinsLoaded) {
				isLoading = false;
				return;
			}
			_this.setState({
				allPage: _this.state.allPage + 1,
				allSort: _this.state.allSort
			});

			return _this.getCoins(function (error, coins) {
				if (error) {
					isLoading = false;
					return $(document.body).trigger('messenger:show', ['error', error]);
				}

				_this.setState({
					allCoinsLoaded: coins.length < (_this.state.isMobile ? 5 : 20),
					allCoins: _this.state.allCoins.concat(coins)
				});

				isLoading = false;
			});
		}
	},
	renderCoins() {
		var _this = this;
		return _this.getCoins(function (error, coins) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			_this.setState({
				allCoins: coins || [],
				isLoading: false,
				isSearching: false
			});
		});
	},
	search: function (searchTerm) {
		var _this = this;

		_this.setState({
			isSearching: true,
			search: searchTerm,
			tagTerm: ''
		});
		typewatch(function () {
			_this.setState({
				isSearching: false,
				showSearch: !!searchTerm,
				sort: '-created',
				page: 1
			});
			_this.renderCoins();
		}, 2000);
	},
	changeSort(event) {
		var _this = this;
		_this.setState({
			allSort: $(event.target).val()
		});
		_this.renderCoins();
	},
	viewBatch(url) {
		this.setState({
			allCoinsLoaded: false,
			allCoins: [],
			allPage: 1
		});
		history.push(url);
	},
	onSelectTag(tag) {
		this.setState({
			isLoading: true,
			isSearching: true,
			allCoins: [],
			allCoinsLoaded: false,
			allPage: 1,
			search: tag.tag,
			batched: true
		});

		//if (tag.tag.match(/(audience|topic):/)) {
			this.setState({
				tagTerm: tag.tag,
				search: ''
			});
		//} else {
		//	this.setState({
		//		search: tag.tag,
		//		tagTerm: ''
		//	});
		//}
		this.renderCoins();
	},
	render: function () {
		const {
			global,
			loggedInUser,
			categoryTerm,
			history,
			viewOnly
			} = this.props;
		const {
			isLoading,
			isSearching,
			tagTerm,
			search,
			allCoins,
			isMobile
			} = this.state;

		return (
			<div className="marketplace-container">
				<div>
					<MarketplaceTabs {...this.props} search={search} globalSort={true}
						onSearch={term => this.search(term)} changeSort={(e) => this.changeSort(e)}/>
				</div>

				<div className="tab-content" id="marketplaceTabsContent">
					{/*<BackButton />

					<PopularSearches onSelect={tag => this.onSelectTag(tag)} />

					<div style={{padding: '10px 10px 0'}}>
						<h2 className="marketplace-title">{_.find(sortCategories, function (category) {
							return category.value === categoryTerm;
						}).title}</h2>
					</div>*/}

					<div className="tab-pane fade show active" id="all" role="tabpanel" aria-labelledby="all-tab">
						{isSearching ? (
							<p className="text-center" style={{
								padding: '5px',
								margin: '10vh 0'
							}}><i className="fas fa-spinner fa-spin"></i></p>
						) : allCoins.length ? (
							<Coins coins={allCoins}
								loggedInUser={loggedInUser}
								path="marketplace"
								batched={true}
								viewBatch={this.viewBatch}
								viewOnly={viewOnly}/>
						) : (<p style={{
							padding: '5px'
						}}>{search.length ? "No results for " + search : (!isLoading && ("No Coins found!"))}</p>)
							}
					</div>
				</div>
			</div>
		)
	}
});

export default MarketplaceSort;

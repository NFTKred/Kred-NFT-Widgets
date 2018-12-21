import React, { Component } from 'react';

import MarketplaceTabs from './Marketplace/Tabs';
import CategoryCoins from './CategoryCoins';
import { PopularSearches } from './PopularSearches';
import { ExploreCoins } from './ExploreCoins';

import { history } from '../js/history';
import { isEmpty, debounce } from 'underscore';
import { checkDomain } from '../js/sos';

import '../css/marketplace.css';

export class ExplorePage extends Component {
	constructor() {
		super();

		this.state = {
			search: '',
			sort: '-created',
			isOwner: false
		};
	}

	static getDerivedStateFromProps(props) {
		return {
			tag: props.tagTerm || ''
		};
	}

	componentDidMount() {
		this._onResize = () => this.forceUpdate();
		window.addEventListener('resize', this._onResize);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this._onResize);
	}

	componentWillMount() {
		var _this = this;

		_this.setState({
			tag: _this.props.tagTerm || '',
			search: _this.props.searchTerm || ''
		});

		//If theres a props global, load all
		//If there's a username, load the user's marketplace
		//If /marketplace with no username - load domain owner's
		// -- If domain doesn't exist - use logged in user's

		if (_this.props.global) {
			return;
		}
		const domain = _this.props.username
			? [_this.props.username, 'kred'].join('.')
			: location.hostname;
		if (
			!_this.props.loggedInUser.id ||
			(domain.length && domain.split('.').length < 2)
		) {
			return;
		}
		return checkDomain(domain, (error, domain) => {
			if (!error && !isEmpty(domain)) {
				_this.setState({
					domain: domain,
					isOwner: _this.props.loggedInUser.id === domain.user.id
				});
			}
		});
	}

	changeSort(event) {
		event.preventDefault();

		this.setState({
			sort: event.target.value
		});
	}

	onSearch(searchTerm) {
		history.push('/marketplace/all');
		this.setState({
			search: searchTerm,
			sort: '-created',
			tag: ''
		});
	}

	onSelectTag(tag) {
		//if (tag.tag.match(/(audience|topic):/)) {
		this.setState({
			tag: tag.tag,
			search: ''
		});
		//} else {
		//	this.setState({
		//		search: tag.tag,
		//		tag: ''
		//	});
		//}
	}

	render() {
		const {
			loggedInUser
			} = this.props;
		const {
			domain,
			tag,
			search,
			sort,
			isOwner
			} = this.state;

		return (
			<div className="marketplace-container">
				<div>
					<MarketplaceTabs
						{...this.props}
						isOwner={isOwner}
						search={search}
						tagTerm={tag}
						onSearch={debounce(term => this.onSearch(term), 500)}
						changeSort={this.changeSort.bind(this)}
						onSelectTag={tag => this.onSelectTag(tag)}
					/>
				</div>

				<div className="tab-content">
					<PopularSearches
						onSelect={tag => this.onSelectTag(tag)}
					/>

					{tag && (
						<div style={{padding: '10px 10px 0'}}>
							<p>
								<strong>Share this Search:</strong> {'https://' + location.hostname + '/tag/' + tag}</p>
						</div>
					)}
					{search && search.length && (
						<div style={{padding: '10px 10px 0'}}>
							<p>
								<strong>Share this Search:</strong> {'https://' + location.hostname + '/search/' + search}</p>
						</div>
					)}

					{search.length || tag ? (
						<ExploreCoins
							filter={{
								search,
								tag,
								sort,
								domain: tag && domain ? domain : ''
							}}
						/>
					) : (
						<CategoryCoins loggedInUser={loggedInUser}/>
					)}
				</div>
			</div>
		);
	}
}

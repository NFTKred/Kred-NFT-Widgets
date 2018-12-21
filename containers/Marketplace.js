import React, { Component } from 'react';
import async from 'async';
import { isEmpty, debounce } from 'underscore';

import MarketplaceTabs from './Marketplace/Tabs';
import { MarketCoins } from './MarketCoins';

import { history } from '../js/history';
import { listMarkets, limits } from '../js/grab';
import { checkDomain, getDomainName } from '../js/sos';
import { formatDisplayName } from '../js/helpers';

import '../css/marketplace.css';
import { getUser, getUserID, isUserLoggedIn } from '../js/auth';

export class MarketplacePage extends Component {
	constructor() {
		super();

		this.state = {
			search: '',
			sort: '-created',
			isOwner: false,
			isLoading: true,
			domainMarketplaceShop: 0,
			myMarketplaceShop: 0,
			marketplaceOwner: {},
			isMarketMaker: false,
			isUserMarketplace: false,
			tag: '',
			any_tag: ''
		};
	}

	static getDerivedStateFromProps(props) {
		var data = {};

		if (props.searchTerm) {
			data.search = props.searchTerm;
		}

		data.tag = props.tagTerm ? props.tagTerm : '';
		return data;
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this._onResize);
	}

	componentDidMount() {
		var _this = this;

		_this._onResize = () => _this.forceUpdate();
		window.addEventListener('resize', _this._onResize);

		//If theres a props global, load all
		//If there's a username, load the user's marketplace
		//If /marketplace with no username - load domain owner's
		// -- If domain doesn't exist - use logged in user's

		const domain = getDomainName();

		if (!isUserLoggedIn()) {
			_this.setState({
				isLoading: false
			});
			return;
		}
		async.auto({
			domainEntity: function (next) {
				if (_this.props.global) {
					return next();
				}
				return checkDomain(domain, next);
			},
			domainMarket: ['domainEntity', function (res, next) {
				//Get the personal market if there's no domain record
				if (isEmpty(res.domainEntity)) {
					return next();
				}
				return listMarkets({user: res.domainEntity.user && res.domainEntity.user.id}, next);
			}],
			myMarket: ['domainEntity', function (res, next) {
				if (!isEmpty(res.domainEntity)) {
					return next();
				}
				return listMarkets({user: getUserID()}, next);
			}],
			limits: function (next) {
				return limits(next);
			}
		}, function (error, results) {
			_this.setState({
				isLoading: false
			});
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}

			var domainEntity = results.domainEntity,
				domainMarket = results.domainMarket,
				myMarket = results.myMarket,
				limits = results.limits;

			if (!isEmpty(domainEntity)) {
				_this.setState({
					domain: domainEntity,
					isOwner: getUserID() === domainEntity.user.id,
					marketplaceOwner: !isEmpty(domainEntity) ? (domainEntity && domainEntity.user) : '',
					isUserMarketplace: !isEmpty(domainEntity)
				});
			}

			if (domainMarket && domainMarket.length && _this.state.isUserMarketplace) {
				_this.setState({
					domainMarketplaceShop: domainMarket[0].market
				});
			}

			if (myMarket && myMarket.length && !_this.state.isUserMarketplace) {
				_this.setState({
					myMarketplaceShop: myMarket[0].market
				});
			}

			if (limits && limits.kyc && limits.kyc.marketmaker) {
				_this.setState({
					isMarketMaker: limits.kyc.marketmaker
				});
			}
		});
	}

	changeSort(event) {
		event.preventDefault();
		var value = $(event.target).val();

		this.setState({
			sort: value
		});
	}

	onSearch(searchTerm) {
		// history.push('/marketplace');
		this.setState({
			search: searchTerm,
			sort: '-created',
			tag: ''
		});
	}

	onSelectTag(tag) {
		if (tag.tag.match(/(audience|topic):/)) {
			this.setState({
				tag: tag.tag,
				search: ''
			});
		} else {
			this.setState({
				search: tag.tag,
				tag: ''
			});
		}
	}

	render() {
		const {
			domain,
			search,
			sort,
			tag,
			any_tag,
			isOwner,
			isLoading,
			domainMarketplaceShop,
			myMarketplaceShop,
			marketplaceOwner,
			isMarketMaker,
			isUserMarketplace
			} = this.state;

		if (isLoading) {
			return;
		}

		const name = marketplaceOwner && formatDisplayName(marketplaceOwner) || '';

		return (
			<div className="marketplace-container">
				<div>
					<MarketplaceTabs
						{...this.props}
						isOwner={isOwner}
						isUserMarketplace={isUserMarketplace}
						marketplaceOwner={marketplaceOwner}
						search={search}
						tagTerm={tag}
						onSearch={debounce(term => this.onSearch(term), 500)}
						changeSort={(e) => this.changeSort(e)}
						changeFilter={this.changeFilter}
						onSelectTag={this.onSelectTag}
					/>
				</div>

				<div className="tab-content">
					{tag &&(
						<div style={{padding: '10px 10px 0'}}>
							<p>
								<strong>Share this Search:</strong> {'https://' + location.hostname + '/marketplace/tag/' + tag}</p>
						</div>
					)}
					{search && search.length && (
						<div style={{padding: '10px 10px 0'}}>
							<p>
								<strong>Share this Search:</strong> {'https://' + location.hostname + '/marketplace/search/' + search}</p>
						</div>
					)}

					{/** Is a Market Marker **/}
				{!!isMarketMaker ? (
					<div className="alert alert-primary">
						<strong>{name} is a Market Marker:</strong>
						Buy CƘr directly for $ USD (or equivalent)
						<a href="/buy" className="btn btn-sm pull-right">Buy Now</a>
					</div>
				) : null}
					<MarketCoins
						{...this.props}
						loggedInUser={getUser()}
						isUserMarketplace={isUserMarketplace}
						domainMarketplaceShop={domainMarketplaceShop}
						myMarketplaceShop={myMarketplaceShop}
						marketplaceOwner={marketplaceOwner}
						domain={domain}
						filter={{
							user: isUserMarketplace && domain && domain.user ? domain.user.id : '',
							domain: tag && domain ? domain : '',
							search,
							sort,
							tag,
							any_tag
						}}
					/>
				</div>
			</div>
		);
	}
}

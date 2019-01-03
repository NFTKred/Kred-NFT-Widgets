import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import _ from 'underscore';

import {checkIfMobile, getFirstName} from '../../js/helpers';

import CreatableSelect from 'react-select/lib/Creatable';
import { isUserLoggedIn } from '../../js/auth';
import { popularTags, topTags } from '../../js/grab';
import { history } from '../../js/history';

class MarketplaceTabs extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showSort: false,
			showSearch: true,
			showFilter: false,
			isMobile: checkIfMobile()
		};
	}
	componentDidMount() {
		var _this = this,
			isLoggedIn = isUserLoggedIn();

		if (location.pathname.match(/marketplace$/) || location.pathname.match(/marketplace\/batch/)) {
			$('.marketplace-tabs a[href="#sales"]').tab('show');
			_this.setState({
				tab: 'sales-tab' //selected tab
			});
		} else if (location.pathname.match('/') || location.pathname.match(/marketplace\/all/)) {
			$('.marketplace-tabs a[href="#all"]').tab('show');
			_this.setState({
				tab: 'all-tab' //selected tab
			});
		}

		$('.marketplace-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			_this.setState({
				tab: $(e.target).attr('id') //selected tab
			});

			if (!_this.props.batchNumber && !_this.state.tagTerm && !_this.props.categoryTerm) {
				history.push($(e.target).attr('id') === 'sales-tab' ? '/marketplace' : '/marketplace/all')
			}
		});

		window.addEventListener('resize', e => _this.resize());

		var audienceTags = ['everyone', 'friends', 'fans', 'family', 'customers', 'prospects', 'staff', 'team', 'bloggers', 'empire.kred', 'empirekred'];

		if (isLoggedIn) {
			topTags({count: 50}, (error, top) =>
					this.setState({
						tags: top.length ? _.filter(top, function (tag){
							var mytag = tag.tag && tag.tag.replace(/^(audience|topic):/, '');
							tag.tag = mytag;
							return $.inArray(mytag, audienceTags) < 0;
						}) : []
					})
			);
		}

		popularTags({count: 50}, (error, popular) =>
				this.setState({
					tags: popular.length ? _.filter(popular, function (tag){
						var mytag = tag.tag && tag.tag.replace(/^(audience|topic):/, '');
						tag.tag = mytag;
						return $.inArray(mytag, audienceTags) < 0;
					}) : []
				})
		);
	}
	resize() {
		this.setState({
			isMobile: checkIfMobile()
		});
	}
	showSort() {
		this.setState({
			showSort: !this.state.showSort,
			showFilter: false,
			//showSearch: false
		});
	}
	showFilter(e) {
		this.setState({
			showFilter: !this.state.showFilter,
			showSort: false,
			showSearch: false
		});
	}
	showSearch(e) {
		this.setState({
			showSearch: !this.state.showSearch,
			showSort: false,
			showFilter: false
		});
	}
	searchFocus(e) {
		var _this = this;

		_this.setState({search: ''});
	}
	searchOption(event) {
		var _this = this,
			searchTerm = event.target.value || '';

		_this.props.onSearch(searchTerm);
	}
	changeSort(event) {
		var _this = this;
		_this.props.changeSort(event);
	}
	render() {
		const {isOwner, isUserMarketplace, marketplaceOwner, loggedInUser, categoryTerm, batchNumber, tagTerm, search,
			onSearch, changeSort, changeFilter, onSelectTag, showSearchBar, showSortToggle, globalSort
			} = this.props;
		const {showSort, showSearch, showFilter, tab, isMobile, tags} = this.state;

		const name = marketplaceOwner && getFirstName(marketplaceOwner) || '';

		return (
			<div className="marketplace-tabs-container">
				<div className={"form-row justify-content-end"}>
					{!!showSearchBar && ((tab === 'all-tab' || tab === 'sales-tab' || isMobile) && ((!tagTerm && !categoryTerm) || batchNumber || !search)) && (
						<i className={"fas fa-search" + (showSearch ? ' selected' : '')}></i>
					)}
					{!!showSearchBar && (<div className={"form-group"
						+ (!!showSearch ? ' col' : (isMobile ? '' : ' col-2 text-right'))}>
								{showSearch && !batchNumber && (
									<input type="search" placeholder="Search" className="form-control" onChange={(e) => this.searchOption(e)}/>
								)}
						</div>)}

						{(tab && tab.match(/(all-tab)/) && (search || tagTerm || batchNumber || globalSort) && !!showSort) && (
							<div className={"form-group col" + !showSearch ? '' : ' text-center'}>
								<div>
									<select className="marketplace-sort form-control form-control-sm" onChange={(e) => this.changeSort(e)}>
										<option value={batchNumber ? "-coin" : "-created"}>Most Recent</option>
										<option value={batchNumber ? "+coin" : "+created"}>Least Recent</option>
										<option value="-value">Highest Value</option>
										<option value="+value">Lowest Value</option>
										<option value="-circulation">Most Circulated</option>
										<option value="+circulation">Least Circulated</option>
										<option value="-likes">Most Liked</option>
										<option value="+likes">Least Liked</option>
									</select>
								</div>
							</div>
						)}

						{tab === 'sales-tab' && !categoryTerm && !!showSort && (
							<div className={"form-group col" + !!showSort ? '' : ' text-center'}>
								<div>
									<select className="marketplace-sort form-control form-control-sm" onChange={(e) => this.changeSort(e)}>
										<option value="-created">Most Recent</option>
										<option value="+created">Least Recent</option>
									</select>
								</div>
							</div>
						)}

					{!!showSortToggle ? (<div className="col-auto">
							{((tab === 'sales-tab' && !categoryTerm) || (tab === 'all-tab' && !!(search || tagTerm || batchNumber || globalSort)))&& (
								<i className={"fas fa-sort-amount-down" + (showSort ? ' selected' : '')} onClick={() => this.showSort()}></i>
							)}
					</div>) : null}

				</div>
			</div>
		)
	}
}

MarketplaceTabs.propTypes = {
	history: PropTypes.shape({
		push: PropTypes.func.isRequired
	})
};

export default MarketplaceTabs;

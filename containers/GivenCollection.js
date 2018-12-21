import React, { Component } from 'react';

import { Spinner } from './Spinner';
import Coins from './Coins';
import CreatableSelect from 'react-select/lib/Creatable';
import { InfiniteScroll } from './InfiniteScroll';
import { NoSearchResults } from './NoSearchResults';

import { getUser } from '../js/auth';
import { checkIfMobile, round } from '../js/helpers';
import { history } from '../js/history';
import { getDomainOwner } from '../js/sos';
import { getWalletsWithoutCheckingLimits, topUserTags, api } from '../js/grab';

import '../css/myCollection';
import { CollectionStats } from './CollectionStats';

export class GivenCollection extends Component {
	state = {
		tags: [],
		search: '',
		owner: null,
		wallets: null,
	};

	async componentDidMount() {
		const owner = await getDomainOwner();

		this.setState({ owner });

		// we are pre-loading this in case we need it for
		// CreateAndGiveYourFirstCoin
		getWalletsWithoutCheckingLimits(
			owner.id,
			wallets =>
				wallets &&
				this.setState({
					wallets,
				})
		);

		topUserTags(owner.id, (error, tags) => {
			if (!error && tags) {
				this.setState({
					tags,
				});
			}
		});
	}

	onSearch(search) {
		this.setState({ search });
	}

	render() {
		const { wallets, search, tags, owner } = this.state;

		if (!owner) {
			return (
				<GivenTemplate>
					<Spinner />
				</GivenTemplate>
			);
		}

		const params = { user: owner.id, sort: '-created', search };

		return (
			<InfiniteScroll
				key={JSON.stringify(params)}
				load={page =>
					api('GET', '/coin/given', 'given', {
						...params,
						page,
					})
				}
				render={coins => (
					<GivenTemplate
						coins={coins}
						tags={tags}
						onSearch={search => this.onSearch(search)}
					>
						{!!coins && (
							<GivenResults
								coins={coins}
								search={search}
								wallets={wallets}
							/>
						)}
					</GivenTemplate>
				)}
			/>
		);
	}
}

function GivenTemplate({ coins, tags, onSearch, children }) {
	const balanceAmount = coins && coins
		.map(({ coin }) => (coin ? coin.value : 0))
		.reduce((memoizer, value) => memoizer + value, 0);

	const balance = round(balanceAmount, 2);

	return (
		<div className="mycollection-container">
			<div className="mycollection-tabs-container">
				{coins && coins.length > 0 && (
					<CollectionStats
						first={`${coins.length} Coins`}
						firstTitle={`Given Coin Count: ${coins.length} Coins`}
						second={`${balance} CƘr`}
						secondTitle={`Given Balance: ${balance} CƘr`}
					/>)
				}

				<CollectionFilter tags={tags} onSearch={onSearch} />
			</div>
			<div className="mycollection-given-container">{children}</div>
		</div>
	);
}

class CollectionFilter extends Component {
	state = {
		showSearch: true,
		showSort: false,
	};

	onSort(e) {
		const { value } = e.target.options[e.target.selectedIndex];

		history.push(`/collection/sort/${value}`);
	}

	toggleSearch() {
		this.setState({ showSearch: !this.state.showSearch, showSort: false });
	}

	toggleSort() {
		this.setState({ showSort: !this.state.showSort });
	}

	render() {
		const { isSearching, tags, onSearch } = this.props;

		const { showSearch, showSort } = this.state;

		return (
			<div class="form-row justify-content-end">
				<i
					className={
						'fas fa-search' + (showSearch ? ' selected' : '')
					}
					onClick={e => this.toggleSearch()}
				/>
				<div
					className={
						'form-group ' +
						(!!showSearch
							? 'col'
							: checkIfMobile()
							? 'col-auto text-center'
							: 'col text-right')
					}
				>
					<CreatableSelect
						className="basic-single collection-search"
						classNamePrefix="select"
						name="search"
						isLoading={isSearching}
						isSearchable={true}
						options={_.unique(
							_.map(tags, function(tag) {
								return {
									label: tag.tag,
									value: tag.tag,
								};
							}),
							function(tag) {
								return tag.label;
							}
						)}
						placeholder="Search"
						autoFocus={true}
						onChange={selectedOptions =>
							onSearch(selectedOptions.value)
						}
						formatCreateLabel={input => {
							return 'Search: ' + input;
						}}
					/>
				</div>

				{showSort && (
					<div
						class={
							'form-group ' +
							(checkIfMobile()
								? !showSearch
									? 'col-auto'
									: 'col-auto text-center'
								: 'col-auto')
						}
					>
						<select
							className="mycollection-sort form-control form-control-sm"
							onChange={e => this.onSort(e)}
						>
							<option value="-created">Most Recent</option>
							<option value="+created">Least Recent</option>
							<option value="-value">Highest Value</option>
							<option value="+value">Lowest Value</option>
							<option value="-circulation">
								Most Circulated
							</option>
							<option value="+circulation">
								Least Circulated
							</option>
							<option value="-likes">Most Liked</option>
							<option value="+likes">Least Liked</option>
							<option value="previouslyheld" selected="selected">
								Previously Held
							</option>
						</select>
					</div>
				)}

				<div className="col-auto">
					<i
						className={
							'fas fa-sort-amount-down' +
							(showSort ? ' selected' : '')
						}
						onClick={e => this.toggleSort()}
					/>
				</div>
			</div>
		);
	}
}

function GivenResults({ coins, search, wallets }) {
	if (coins.length) {
		return <Coins coins={coins} disableHover={true} />;
	}

	if (search.length) {
		<NoSearchResults search={search} />;
	}
}


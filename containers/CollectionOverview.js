import React, { Component } from 'react';
import CreatableSelect from 'react-select/lib/Creatable';
import { unique } from 'underscore';

import { CollectionTemplate } from './CollectionTemplate';
import { getUserID, getUser, isUserLoggedIn } from '../js/auth';
import CategoryCoins from './CategoryCoins';
import { getDomainOwner } from '../js/sos';
import { api, topUserTags } from '../js/grab';

import { Spinner } from './Spinner';
import { history } from '../js/history';
import { CollectionStats } from './CollectionStats';
import { round } from '../js/helpers';
import { ExplorePage } from './ExplorePage';

export class CollectionOverview extends Component {
	state = {
		isLoading: true,
		hasCoins: null,
		user: null,
		wallet: null
	};

	async componentWillMount() {
		window.loggedInButNoCoins = false;

		const user = await this.loadUser();
		this.loadTopTags(user);
		this.loadBalance(user);
	}

	async loadUser() {
		const user = await getDomainOwner();

		this.setState({
			user,
			isLoading: !!user
		});

		return user;
	}

	loadTopTags(user) {
		topUserTags(user.id, (error, tags) => {
			this.setState({
				topTags: tags || []
			});
		});
	}

	async loadBalance(user) {
		const wallets = await api('GET', '/coin/wallets', 'wallets', {
			user: user.id
		});

		if (!wallets || wallets.length === 0) {
			console.warn('No wallet found for user', user.id);
			this.setState({ hasCoins: false });
			return;
		}

		const wallet = wallets[0];

		const balance = await api('GET', '/coin/balance', 'balance', {
			currency: 1,
			wallet: wallet.wallet
		});

		const hasCoins = balance.minted_coins > 0;

		this.setState({ balance, hasCoins, wallet, isLoading: false });
	}

	handleSearch(term) {
		history.push(`/collection/search/${encodeURIComponent(term)}`);
	}

	renderCategories() {
		const { isLoading, hasCoins, user, topTags, wallet } = this.state;

		// wait until we determine whether this user has coins
		if (hasCoins === null) {
			return <Spinner />;
		}

		// if they don't have coins, choose what to show
		if (!hasCoins) {
			if (location.pathname === '/' && isUserLoggedIn()) {
				window.loggedInButNoCoins = true;
				return <ExplorePage global={true} />;
			}
		}

		// NOTE: it's ok for this to load late
		const topTag = (topTags && topTags.length && topTags[0].tag) || '';

		return (
			<CategoryCoins
				userId={user.id}
				path="/collection"
				sortCategories={[
					{
						id: 1,
						title: 'Popular',
						type: 'sort',
						value: '-likes'
					},
					{
						id: 2,
						title: topTag || '',
						type: 'tag',
						value: topTag
					},
					{
						id: 3,
						title: 'All',
						type: 'sort',
						value: '-updated',
						path: '/collection/all'
					}
				]}
			/>
		);
	}

	renderBalance() {
		const { balance } = this.state;

		if (!balance) {
			return <CollectionStats />;
		}

		const myCoinAmount = round(balance.minted_amount, 2);
		const myCoinCount = round(balance.minted_coins, 2);
		const myBalance = round(balance.unminted_amount, 2);

		return (
			<CollectionStats
				first={`${myCoinCount} Coins`}
				firstTitle={`Estimated Value: ${myCoinAmount} CƘr`}
				second={`${myBalance} CƘr`}
				secondTitle={`Balance: ${myBalance} CƘr`}
			/>
		);
	}

	render() {
		const { topTags, hasCoins } = this.state;
		const tags = topTags ? topTags.map(tag => tag.tag) : [];

		return (
			<CollectionTemplate
				filter={
				!!hasCoins && (
					<div>
						<CollectionSearch
						tags={tags}
						onSearch={term => this.handleSearch(term)}
						/>
						{this.renderBalance()}
					</div>
					)

				}
			>
				{this.renderCategories()}
			</CollectionTemplate>
		);
	}
}

function CollectionSearch({ tags, onSearch }) {
	return (
		<div className="form-row justify-content-end">
			<i className="fas fa-search selected" />
			<div className="form-group col">
				<CreatableSelect
					className="basic-single collection-search"
					classNamePrefix="select"
					name="search"
					isSearchable={true}
					options={unique(
						tags.map(tag => ({
							label: tag,
							value: tag
						})),
						tag => tag.value
					)}
					placeholder="Search"
					onChange={selectedOptions =>
						onSearch(selectedOptions.value)
					}
					formatCreateLabel={input => {
						return 'Search: ' + input;
					}}
				/>
			</div>
		</div>
	);
}

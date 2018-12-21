import React from 'react';
import { omit, map } from 'underscore';
import { InfiniteScrollComponent } from './InfiniteScroll';
import { SearchingMessage } from './SearchingMessage';
import { CoinsSearchResults } from './CoinsSearchResults';
import { GrabApi } from './GrabApi';
import { checkIfMobile } from '../js/helpers';

export class MarketCoins extends InfiniteScrollComponent {
	render() {
		const { filter, isUserMarketplace, domainMarketplaceShop, myMarketplaceShop, marketplaceOwner, loggedInUser, domain, viewOnly } = this.props;
		const { infiniteScrollPages } = this.state;

		return (
			<div>
				{infiniteScrollPages.map(page =>
						<GrabApi
							method="GET"
							path="/coin/marketplace"
							params={{
								count: checkIfMobile() ? 10 : 20,
								flagged: true,
								nsfw: true,
								status: 'active',
								batched: true,
								showcase: 'sort',
								...filter,
								page
								}}
							loading={<SearchingMessage />}
							render={({ market }) => {
								console.log("[Cache Data] Market Save", market.length);
								localStorage.setItem('BTC', market);
								if (!isUserMarketplace && !!myMarketplaceShop) {
									{/* CUSTOM MARKETPLACE */}
									return (<GrabApi
										method="GET"
										path="/coin/coins"
										params={{
											market: myMarketplaceShop,
											count: 50,
											flagged: true,
											nsfw: true,
											status: 'active',
											batched: true,
											showcase: 'sort'
										}}
										loading={<SearchingMessage />}
										render={({ coins }) => {
											if (coins.length) {
												this.onPageSuccess(page, coins);
											}

											if (market.length || coins.length || page === 1) {
												return (
													<CoinsSearchResults
														viewOnly={viewOnly}
														domainMarketplaceShop={domainMarketplaceShop}
														myMarketplaceShop={myMarketplaceShop}
														marketplaceOwner={marketplaceOwner}
														coins={map(market, function (marketItem) {
															if (find(coins, function (coin) {
																	return coin.coin === marketItem.coin.coin;
																})) {
																marketItem.inMyShop = true;
															}
															return marketItem;
														})}
														filter={filter}
														batched={true}
														loggedInUser={loggedInUser}
													/>
												);
											}
										}}
									/>)
								} else if (!!isUserMarketplace && !!domainMarketplaceShop) {
									{/* DOMAIN MARKETPLACE */}
									return (<GrabApi
										method="GET"
										path="/coin/coins"
										params={{
											market: domainMarketplaceShop,
											count: checkIfMobile() ? 10 : 20,
											flagged: true,
											nsfw: true,
											status: 'active',
											batched: true,
											showcase: 'sort',
											page
										}}
										loading={<SearchingMessage />}
										render={({ coins }) => {
											if (coins.length) {
												this.onPageSuccess(page, coins);
											}

											if (market.length || coins.length || page === 1) {
												return (
													<CoinsSearchResults
														viewOnly={viewOnly}
														domainMarketplaceShop={domainMarketplaceShop}
														marketplaceOwner={marketplaceOwner}
														coins={market.concat(coins)}
														filter={filter}
														batched={true}
														loggedInUser={loggedInUser}
													/>
												);
											}
										}}
									/>)
								} else {
									{/* GLOBAL/USER'S MARKETPLACE */}
									if (isUserMarketplace && !market.length) {
										{/* Show global marketplace on personal domain if user has none on sale */}
										var omitFilter = omit(filter, 'user');
										return (<GrabApi
											method="GET"
											path="/coin/marketplace"
											params={{
												count: checkIfMobile() ? 10 : 20,
												flagged: true,
												nsfw: true,
												status: 'active',
												batched: true,
												showcase: 'sort',
												...omitFilter,
												page
											}}
											loading={<SearchingMessage />}
											render={({ market }) => {
												if (market.length) {
													this.onPageSuccess(page, market);
												}
												return (
													<CoinsSearchResults
														viewOnly={viewOnly}
														domainNoneOnSale={page === 1}
														domainMarketplaceShop={domainMarketplaceShop}
														marketplaceOwner={marketplaceOwner}
														coins={market}
														filter={omitFilter}
														batched={true}
														loggedInUser={loggedInUser}
													/>
												);
											}}
										/>);
									} else if (market.length || page === 1) {
										return (
											<CoinsSearchResults
												viewOnly={viewOnly}
												domainMarketplaceShop={domainMarketplaceShop}
												marketplaceOwner={marketplaceOwner}
												coins={market}
												filter={filter}
												batched={true}
												loggedInUser={loggedInUser}
											/>
										);
									}
								}
							}}
						/>
				)}
			</div>
		);
	}
}

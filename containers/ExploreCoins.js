import React, { Component } from 'react';

import { InfiniteScroll } from './InfiniteScroll';
import { SearchingMessage } from './SearchingMessage';
import { CoinsSearchResults } from './CoinsSearchResults';
import { checkIfMobile } from '../js/helpers';
import { api } from '../js/grab';

export function ExploreCoins({ filter }) {
	return (
		<InfiniteScroll
			key={JSON.stringify(filter)}
			load={page =>
				api('GET', '/coin/coins', 'coins', {
					count: checkIfMobile() ? 10 : 20,
					minted: true,
					nsfw: true,
					flagged: true,
					status: 'active',
					batched: true,
					showcase: 'sort',
					...filter,
					page,
				})
			}
			loading={<SearchingMessage />}
			render={coins =>
				coins && (
					<CoinsSearchResults
						coins={coins}
						filter={filter}
						batched={true}
					/>
				)
			}
		/>
	);
}

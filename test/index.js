import React from 'react';
import { render } from 'react-dom';

import { Index, Suite } from './test-helper.js';

import { PopularSearches } from '../containers/PopularSearches.js';
import { CoinProfileMeta } from '../containers/CoinProfileMeta';

const root = document.createElement('div');
document.body.appendChild(root);

render(
	<div>
		<h1>CryptoKred Component Test</h1>

		<Index />

		<Suite name="PopularSearches">
			<PopularSearches onSelect={tag => alert(`${tag.tag} selected`)} />
		</Suite>

		<Suite name="CoinProfileMeta">
			<CoinProfileMeta
				coin={{
					kitty: 697133,
					name: 'Roberto',
					value: 1,
					count: 1,
					color: '#fde9e4',
					text_color: '#ffffff',
					back:
						'https://static.socialos.net/inspinia/html/crypto/images/catpaw.svg',
					face:
						'https://img.cn.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/697133.svg',
					meta: {
						type: 'cryptokitty',
						kittyid: 697133,
						generation: 8,
						created_at: '2018-04-17T04:26:06.000Z',
						fancy: null
					}
				}}
			/>
		</Suite>

	</div>,
	root
);

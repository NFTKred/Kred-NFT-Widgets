import React from 'react';
import { render, cleanup, waitForElement } from 'react-testing-library';
import { expect } from 'chai';

import { mockRequest, unmockRequest } from '../js/request';
import { setUser } from '../js/auth';
import { CollectionOverview } from './CollectionOverview';

import JESSE_COINS from '../test/fixtures/jesse-coins.json';
import JESSE_USER from '../test/fixtures/jesse-user-home.json';
import JESSE_WALLETS from '../test/fixtures/jesse-wallets.json';
import JESSE_BALANCE from '../test/fixtures/jesse-balance.json';

afterEach(cleanup);
afterEach(unmockRequest);
afterEach(() => setUser());

describe('<CollectionOverview />', () => {
	it('should show the Popular category', async () => {
		setUser(JESSE_USER);

		mockRequest({
			'/coin/toptags': {
				tags: [],
			},
			'/coin/wallets': { wallets: JESSE_WALLETS },
			'/coin/balance': { balance: JESSE_BALANCE },
			'/coin/coins': { coins: JESSE_COINS },
		});

		const { getByTitle } = render(<CollectionOverview />);

		const popular = await waitForElement(() => getByTitle('Popular'));

		expect(popular).to.not.be.empty;
	});

	it('should show the Top Tag category', async () => {
		setUser(JESSE_USER);

		mockRequest({
			'/coin/toptags': {
				tags: [
					{
						tag: 'MyTopTag',
					},
				],
			},
			'/coin/wallets': { wallets: JESSE_WALLETS },
			'/coin/balance': { balance: JESSE_BALANCE },
			'/coin/coins': { coins: JESSE_COINS },
		});

		const { getByTitle } = render(<CollectionOverview />);

		const topTag = await waitForElement(() => getByTitle('MyTopTag'));

		expect(topTag).to.not.be.empty;
	});

	it('should show the All category', async () => {
		setUser(JESSE_USER);

		mockRequest({
			'/coin/toptags': {
				tags: [],
			},
			'/coin/wallets': { wallets: JESSE_WALLETS },
			'/coin/balance': { balance: JESSE_BALANCE },
			'/coin/coins': { coins: JESSE_COINS },
		});

		const { getByTitle } = render(<CollectionOverview />);

		const all = await waitForElement(() => getByTitle('All'));

		expect(all).to.not.be.empty;
	});

	it('should show a Search bar', async () => {
		mockRequest({
			'/coin/toptags': {
				tags: [],
			},
			'/coin/wallets': { wallets: JESSE_WALLETS },
			'/coin/balance': { balance: JESSE_BALANCE },
			'/coin/coins': { coins: JESSE_COINS },
		});

		const { getByText } = render(<CollectionOverview />);

		const search = await waitForElement(() => getByText('Search'));

		expect(search).to.not.be.empty;
	});

	it('should show collection stats', async () => {
		mockRequest({
			'/coin/toptags': {
				tags: [],
			},
			'/coin/wallets': { wallets: JESSE_WALLETS },
			'/coin/balance': { balance: JESSE_BALANCE },
			'/coin/coins': { coins: JESSE_COINS },
		});

		const { getByText } = render(<CollectionOverview />);

		const coinCount = await waitForElement(() => getByText('27 Coins'));
		const coinBalance = await waitForElement(() => getByText('85 CƘr'));

		expect(coinCount).to.not.be.empty;
		expect(coinBalance).to.not.be.empty;
	});
});

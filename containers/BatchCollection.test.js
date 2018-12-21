import React from 'react';
import { render, cleanup, waitForElement } from 'react-testing-library';
import { expect } from 'chai';

import { mockRequest, unmockRequest } from '../js/request';
import { setUser } from '../js/auth';
import { BatchCollection } from './BatchCollection';

import JESSE_COIN_BATCH from '../test/fixtures/jesse-coin-batch.json';
import JESSE_USER from '../test/fixtures/jesse-user-home.json';

afterEach(cleanup);
afterEach(unmockRequest);
afterEach(() => setUser());

describe('<BatchCollection/>', () => {
	it('should show the batch title', async () => {
		mockRequest({
			'/coin/coins': { coins: JESSE_COIN_BATCH }
		});

		const { getByText } = render(<BatchCollection />);

		const title = await waitForElement(() => getByText('Batch Test'));

		expect(title).to.not.be.empty;
	});

	it('should show the coin count', async () => {
		mockRequest((method, url, data) => {
			if (url.indexOf('/coin/coins') !== -1) {
				if (data.batched) {
					// this is providing the coin count
					return { coins: [{ coins: 123 }]};
				} else {
					return { coins: JESSE_COIN_BATCH };
				}
			}
		});

		const { getByText } = render(<BatchCollection />);

		const coinCount = await waitForElement(() => getByText('123 coins'));

		expect(coinCount).to.not.be.empty;
	});

	it('should show somebody elses coins with Request button', async () => {
		mockRequest({
			'/coin/coins': { coins: JESSE_COIN_BATCH }
		});

		const { getByText } = render(<BatchCollection />);

		const requestButton = await waitForElement(() => getByText('Request'));

		expect(requestButton).to.not.be.empty;
	});

	it('should show our coins with Give button', async () => {
		setUser(JESSE_USER);

		mockRequest({
			'/coin/coins': { coins: JESSE_COIN_BATCH }
		});

		const { getByText } = render(<BatchCollection />);

		const giveButton = await waitForElement(() => getByText('Give'));

		expect(giveButton).to.not.be.empty;
	});

	it('should show owner an Auction All button that opens a modal', async () => {
		setUser(JESSE_USER);

		mockRequest({
			'/coin/coins': { coins: JESSE_COIN_BATCH }
		});

		const { getByText } = render(<BatchCollection />);

		const auctionButton = await waitForElement(() => getByText('Auction All'));

		auctionButton.click();

		const auctionTitle = await waitForElement(() => getByText('Auction this Coin'));

		expect(auctionTitle).to.not.be.empty;
	});

	it('should show owner an Sell All button that opens a modal', async () => {
		setUser(JESSE_USER);

		mockRequest({
			'/coin/coins': { coins: JESSE_COIN_BATCH }
		});

		const { getByText } = render(<BatchCollection />);

		const sellButton = await waitForElement(() => getByText('Sell All'));

		sellButton.click();

		const sellTitle = await waitForElement(() => getByText('Sell this Coin'));

		expect(sellTitle).to.not.be.empty;
	});

	it('should show owner a settings button that toggles settings', async () => {
		setUser(JESSE_USER);

		mockRequest({
			'/coin/coins': { coins: JESSE_COIN_BATCH }
		});

		const { getByTestId, getByLabelText } = render(<BatchCollection />);

		const settingsButton = await waitForElement(() => getByTestId('togglesettings'));

		settingsButton.click();

		const settingsTitle = await waitForElement(() => getByLabelText('Show in Collection'));

		expect(settingsTitle).to.not.be.empty;
	});
});

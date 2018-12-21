import React from 'react';
import { render, cleanup, waitForElement } from 'react-testing-library';
import { expect } from 'chai';

import { mockRequest, unmockRequest } from '../js/request';
import { setUser } from '../js/auth';
import MyCollection from './MyCollection';

import JESSE_COIN_LIMITS from '../test/fixtures/jesse-coin-limits.json';

afterEach(cleanup);
afterEach(unmockRequest);
afterEach(() => setUser());

describe('<MyCollection/>', () => {
	it('should show a spinner when nothing has loaded', async () => {
		mockRequest({
			'/coin/limits': JESSE_COIN_LIMITS,
			'/coin/toptags': { tags: [] },
			'/coin/wallets': [],
		});

		const { getByTestId } = render(<MyCollection />);

		const spinner = await waitForElement(() => getByTestId('spinner'));

		expect(spinner).to.not.be.empty;
	});
});

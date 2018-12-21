import React from 'react';
import { KittyCollection } from './KittyCollection';
import { render, waitForElement, cleanup } from 'react-testing-library';
import { expect } from 'chai';
import { mockRequest, unmockRequest } from '../js/request';
import { mockWeb3, unmockWeb3 } from '../test/mock-web3.js';

import CATTRIBUTES from '../test/fixtures/crypto-kitties-cattributes.json';
import JESSE_CRYPTO_KITTIES from '../test/fixtures/jesse-crypto-kitties.json';

describe('<KittyCollection/>', () => {
	afterEach(cleanup);
	afterEach(unmockRequest);
	afterEach(unmockWeb3);
	
	it('should render a spinner', async () => {
		mockRequest({
			'/cattributes': CATTRIBUTES,
		});

		const { getByTestId } = render(<KittyCollection />);

		const spinner = await waitForElement(() => getByTestId('spinner'));

		expect(spinner).to.not.be.empty;
	});

	it('should provide link to install MetaMask if no web3 available', async () => {
		mockRequest({
			'/cattributes': CATTRIBUTES,
		});

		const { getByText } = render(<KittyCollection />);

		const link = await waitForElement(() => getByText('Install MetaMask'));

		expect(link.href).to.equal('https://metamask.io/');
	});

	it('should render kitty coin if kitties found', async () => {
		mockWeb3();

		mockRequest({
			'/cattributes': CATTRIBUTES,
			'/v2/kitties': { kitties: JESSE_CRYPTO_KITTIES },
		});

		const { getByText } = render(<KittyCollection />);

		const name = await waitForElement(() => getByText('Roberto'));

		expect(name).to.not.be.empty;
	});
});

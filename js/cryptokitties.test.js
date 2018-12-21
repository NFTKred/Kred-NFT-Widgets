import { expect } from 'chai';
import JESSE_CRYPTO_KITTIES from '../test/fixtures/jesse-crypto-kitties.json';
import { getCoinsFromKitties, getEthAccount } from './cryptokitties';

describe('CryptoKitties', () => {
	describe('getEthAccount', () => {
		it('should return an account ID when mocked', async () => {
			const account = await getEthAccount();

			expect(account).to.equal('ETHEREUM_ACCOUNT_ID');
		});
	});

	describe('getCoinsFromKitties', () => {
		it('should return a list of coins', () => {
			const coins = getCoinsFromKitties(JESSE_CRYPTO_KITTIES);

			expect(coins).to.deep.equal([
				{
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
						address: '0x940e91274fba71a9e5d3713ae7c4a5165c8844b9',
						id: 697133,
						generation: 8,
						subtype: null,
						time: 1523939166,
					},
					cattributes: [
						'sphynx',
						'pouty',
						'amur',
						'wonky',
						'coralsunrise',
						'greymatter',
						'icy',
						'poisonberry',
					],
				},
			]);
		});
	});
});

import _ from 'underscore';
import request from './request';
import tinycolor from 'tinycolor2';

export async function getCryptoKitties(page, data) {
	const kitties = await getCryptoKittiesData(page, data);

	return getCoinsFromKitties(kitties);
}

export async function getCryptoKittyByID(kittyID) {
	try {
		const kitty = await request(
			'GET',
			`https://api.cryptokitties.co/kitties/${kittyID}`
		);

		return getCoinsFromKitties([kitty]);
	} catch (e) {
		return [];
	}
}

export async function getEthAccount() {
	if (typeof web3 === 'undefined' || typeof ethereum === 'undefined') {
		return;
	}

	//if (!!location.hostname.match(/(test\.app\.crypto\.kred|localhost)/)) {
	//	if (web3.version.network !== "4") {
	//		return callback('Oops, you’re on the wrong network. Simply open MetaMask and switch over to the Rinkeby Test Network.');
	//	}
	//} else {
	if (web3.version.network !== '1') {
		throw new Error(
			'Oops, you’re on the wrong network. Simply open MetaMask and switch over to the Main Ethereum Network.</p>'
		);
	}
	//}

	if (window.ethereum) {
		window.web3 = new Web3(ethereum);
		try {
			// Request account access if needed
			const results = await ethereum.enable();
			return results && results[0];
		} catch (error) {
			// User denied account access...
			return;
		}
	}

	// Legacy dapp browsers...
	if (window.web3) {
		window.web3 = new Web3(web3.currentProvider);

		// Accounts always exposed
		if (web3.eth.accounts && !web3.eth.accounts.length) {
			return;
		}

		return web3.eth.accounts && web3.eth.accounts[0];
	}
}

async function getCryptoKittiesData(page, data) {
	const owner_wallet_address = await getEthAccount();

	if (!owner_wallet_address) {
		return [];
	}

	try {
		const { kitties } = await request(
			'GET',
			'https://api.cryptokitties.co/v2/kitties',
			_.extend(
				{
					offset: !page || page === 1 ? 0 : page * 20,
					limit: 20,
					owner_wallet_address,
					orderBy: 'id',
					orderDirection: 'desc',
				},
				data
			)
		);

		return kitties;
	} catch (e) {
		return [];
	}
}

export function getCoinsFromKitties(kitties) {
	return _.compact(
		_.map(kitties, function({
			id,
			name,
			color,
			image_url_cdn,
			generation,
			created_at,
			owner,
			fancy_type,
			enhanced_cattributes,
		}) {
			if (!color || !image_url_cdn) {
				return;
			}

			return {
				kitty: id,
				name: name && name.substring(0, 22),
				value: 1,
				count: 1,
				color: getKittyColor(color),
				text_color: tinycolor(getKittyColor(color))
					.brighten(20)
					.toString(),
				face: image_url_cdn,
				back:
					'https://static.socialos.net/inspinia/html/crypto/images/catpaw.svg',
				meta: {
					type: 'cryptokitty',
					address: owner && owner.address,
					id: id,
					time: new Date(created_at).getTime() / 1000,
					subtype: fancy_type,
					generation: generation,
				},
				cattributes: _.pluck(enhanced_cattributes, 'description'),
			};
		})
	);
}

export function getCattributes() {
	return request('GET', 'https://api.cryptokitties.co/cattributes');
}

export function refreshOnceMetaMaskAvailable() {
	if (typeof web3 === 'undefined') {
		if (window.web3 && web3.eth && web3.eth.accounts) {
			const initialLength = web3.eth.accounts.length;

			// refresh the page if MetaMask accounts length changes
			return setInterval(function() {
				if (web3.eth.accounts.length !== initialLength) {
					window.location.reload();
				}
			}, 1000);
		}
	}
}

const kittyColorPalette = {
	coral: '#c5eefa',
	babyblue: '#dcebfc',
	topaz: '#d1eeeb',
	mintgreen: '#cdf5d4',
	limegreen: '#d9f5cb',
	babypuke: '#eff1e0',
	chestnut: '#efe1da',
	strawberry: '#fcdede',
	pumpkin: '#fae1ca',
	gold: '#faf4cf',
	sizzurp: '#dfdffa',
	bubblegum: '#fadff4',
	violet: '#ede2f5',
	coralsunrise: '#fde9e4',
	cyan: '#c5eefa',
	doridnudibranch: '#faeefa',
	eclipse: '#e5e7ef',
	forgetmenot: '#dcebfc',
	parakeet: '#e5f3e2',
	sapphire: '#d3e8ff',
	thundergrey: '#eee9e8',
	twilightsparkle: '#ede2f5',
};

export function getKittyColor(color) {
	return kittyColorPalette[color];
}

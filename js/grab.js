import async from 'async';
import _ from 'underscore';
import request from './request';
import {getToken} from './auth';
import {checkIfMobile} from '../js/helpers';

const url = window.grabApiUrl;
const limits = async.memoize(getLimits);

//https://docs.socialos.io/reference

function api(method, path, property, params) {
	if (!params && typeof property === 'object') {
		params = property;
		property = undefined;
	}

	return new Promise((resolve, reject) =>
		request(method, [url, path].join(''), {
			...params,
			token: getToken()
		}, (error, res) => {
			if (error || res.error) {
				reject(error || res.error);
			} else if (property && property in res) {
				resolve(res[property]);
			} else {
				resolve(res);
			}
		})
	);
}

function userSetup(callback) {
	request('GET', [url, '/user/setup'].join(''), {
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.wallet);
	});
}

function openWallet(data, callback) {
	//name, address, platform
	request('POST', [url, '/coin/open'].join(''), _.extend(data, {
		token: getToken()
	}), callback);
}

function getWallets(user, callback) {
	requireCanHoldTokens(function (error) {
		if (error) {
			return callback(error);
		}

		getWalletsWithoutCheckingLimits(user, callback);
	});
}

function requireCanHoldTokens(callback) {
	limits(function (error, limits) {
		if (error) {
			return callback(error);
		}
		if (limits.kyc && !limits.kyc.hold_tokens) {
			return callback("Your local regulations prohibit us from giving or selling you CKr, so you can't hold Coins at this time. We will email you if those regulations change.");
		}

		callback();
	});
}

// this function exists so that we can call requireCanHoldTokens in parallel
// to speed things up (eg. MyCollection@renderCoins)
// but I didn't want to break this functionality which is assumed by most calls to getWallets
function getWalletsWithoutCheckingLimits(user, callback) {
	return request('GET', [url, '/coin/wallets'].join(''), {
		user: user,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.wallets);
	});
}

function getWallet(walletId, callback) {
	request('GET', [url, '/coin/wallet'].join(''), {
		wallet: walletId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.wallet);
	});
}

function held(callback) {
	request('GET', [url, '/coin/held'].join(''), {
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.held);
	});
}

function remind(callback) {
	request('GET', [url, '/coin/remind'].join(''), {
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function getWalletCoins(walletId, sort, page, filter, callback) {
	callback = _.last(arguments);
	request('GET', [url, '/coin/coins'].join(''), _.extend({
		count: checkIfMobile() ? 10 : 20,
		wallet: walletId,
		sort: sort || '',
		page: page || 1,
		token: getToken()
	}, (filter || {})), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coins);
	});
}

function getUserCoins(userId, sort, page, filter, callback) {
	callback = _.last(arguments);
	request('GET', [url, '/coin/coins'].join(''), _.extend({
		count: checkIfMobile() ? 10 : 20,
		user: userId,
		sort: sort || '',
		page: page || 1,
		token: getToken()
	}, (filter || {})), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coins);
	});
}

function getCoin(data, callback) {
	//coin OR symbol + sequence
	request('GET', [url, '/coin/coin'].join(''), _.extend(data, {
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coin);
	});
}

function getBatchSummary(batchNumber, callback) {
	request('GET', [url, 'coin/batch', batchNumber].join('/'), {
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function getCoinHistory(coinId, user, data, callback) {
	callback = _.last(arguments);
	coinId = _.first(_.initial(arguments)) || null;
	request('GET', [url, '/coin/history'].join(''), _.extend({
		user: user,
		coin: coinId,
		token: getToken()
	}, data), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.history);
	});
}

function getCoinOwners(coinId, callback) {
	request('GET', [url, '/coin/owners'].join(''), {
		coin: coinId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.history);
	});
}

function getMarket(data, callback) {
	//Lists currently active sales and auctions.
	//data: user, coin, sort, page
	callback = _.last(arguments);
	request('GET', [url, '/coin/marketplace'].join(''), _.extend(data, {
		count: checkIfMobile() ? 10 : 20,
		flagged: true,
		nsfw: true,
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.market);
	});
}

function getSales(data, callback) {
	//Lists currently active sales.
	//data: user, coin, sort, page
	callback = _.last(arguments);
	request('GET', [url, '/coin/sales'].join(''), _.extend(data, {
		flagged: true,
		nsfw: true,
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.sales);
	});
}

function getAuctions(data, callback) {
	//Lists currently active auctions.
	//data: user, coin, sort, page
	callback = _.last(arguments);
	request('GET', [url, '/coin/auctions'].join(''), _.extend(data, {
		flagged: true,
		nsfw: true,
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.auctions);
	});
}

function getFreshRequests(data, callback) {
	//The /requests method lets you list requests by user, sender, coin, currency, batch and so on.
	callback = _.last(arguments);
	request('GET', [url, '/coin/requests'].join(''), _.extend(data, {
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.requests);
	});
}

var cachedRequests;

function getRequests(data, callback) {
	if (!cachedRequests) {
		cachedRequests = async.memoize(getFreshRequests);
	};

	return cachedRequests(data, callback);
}

function getBalance(walletId, callback) {
	request('GET', [url, '/coin/balance'].join(''), {
		currency: 1,
		wallet: walletId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.balance);
	});
}

function sendCoin(data, toWallet, text, callback) {
	// data could be {wallet: '' OR coin: ''}
	// Send the specified coin (specified by coin number or uuid, or batch symbol and sequence)
	// to the specified wallet, with an optional text message.
	//
	// Requirements: (These are common to most methods acting on coins.)
	// The coin must exist.
	// You must own the coin.
	// The coin cannot be for sale or in an active or pending auction, or be held for collection.
	// The target wallet must already exist
	request('POST', [url, '/coin/send'].join(''), _.extend(data, {
		wallet: toWallet,
		text: text || '',
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function giftCoin(data, toWallet, text, callback) {
	// data could be {wallet: '' OR coin: ''}
	// Send the specified coin (specified by coin number or uuid, or batch symbol and sequence)
	// to the specified wallet, with an optional text message.
	//
	// Requirements: (These are common to most methods acting on coins.)
	// The coin must exist.
	// You must own the coin.
	// The coin cannot be for sale or in an active or pending auction, or be held for collection.
	// The target wallet must already exist
	request('POST', [url, '/coin/gift'].join(''), _.extend(data, {
		wallet: toWallet,
		text: text || '',
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function holdCoin(coinId, platform, address, text, callback) {
	// Hold a coin to be collected by someone on an external network.
	// The user can be identified by a code (generated by the call) or by OAuth flow matching the platform and address.
	// For email, call hold, with platform=email and address=address, and you'll get back a code you can email to them.
	// You can use that code with the /collect method to collect the coin.
	// For Twitter, call hold with platform=twitter and address=@name, and you'll get a code you can throw away.
	request('POST', [url, '/coin/hold'].join(''), {
		coin: coinId,
		platform: platform,
		address: address,
		text: text || '',
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function collectCoin(coinCode, wallet, callback) {
	// Collect a coin held for you using a code supplied by email, SMS, or private message.
	// Alternately, collect all coins held for you on any authenticated social accounts.
	// Coins are deposited into the specified wallet.
	request('POST', [url, '/coin/collect'].join(''), {
		code: coinCode,
		wallet: wallet,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coin);
	});
}

function requestCoin(coinId, wallet, callback) {
	// Where coin is the coin you would like and wallet is your wallet.
	request('POST', [url, '/coin/request'].join(''), {
		coin: coinId,
		wallet: wallet,
		token: getToken()
	}, function (error, res) {
		cachedRequests = null;

		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function sellCoin(coinId, batch, price, callback) {
	//List a coin for sale
	request('POST', [url, '/coin/sell'].join(''), {
		coin: coinId,
		batch: batch,
		price: price,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function surrenderCoin(coinId, callback) {
	// Surrender a coin
	// Returns 90% of the coin's face value to the coin wallet and places the coin in our own holding wallet.
	request('POST', [url, '/coin/surrender'].join(''), {
		coin: coinId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function auctionCoin(coinId, batch, start, end, maximum, minimum, callback) {
	//Offer a coin for auction.  Start and end times can be numeric or string timestamps.
	// Mode is either normal, in which case you should provide a reserve price, or reverse (for "Dutch" auctions),
	// in which case you provide maximum and minimum prices.
	request('POST', [url, '/coin/auction'].join(''), {
		coin: coinId,
		batch: batch,
		start: start,
		end: end,
		maximum: maximum,
		minimum: minimum,
		mode: 'reverse',
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.auction);
	});
}

function buyCoin(id, walletId, callback) {
	// Buy a coin listed for sale using funds from the specified wallet.
	// You must have sufficient funds in bare coins; this will throw an exception rather than consuming collectable coins.
	request('POST', [url, '/coin/buy'].join(''), _.extend(id, {
		wallet: walletId,
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function giveawayCoin(batch, coins, hours, callback) {
	// batch coins=int text=string hours=int
	// /giveaway will return the code for the claims. It will automatically ensure that there's only one claim per user and stop when it reaches the coin limit.
	request('POST', [url, '/coin/giveaway'].join(''), {
		batch: batch,
		coins: coins,
		hours: hours,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.giveaway);
	});
}

function giveaways(batch, callback) {
	// batch
	// /giveaways returns any active giveaways.
	request('POST', [url, '/coin/giveaways'].join(''), {
		batch: batch,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.giveaways);
	});
}

function claimCoin(code, wallet, callback) {
	// code wallet text=string
	request('POST', [url, '/coin/claim'].join(''), {
		code: code,
		wallet: wallet,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coin);
	});
}

function bidOnCoin(auction, amount, walletId, callback) {
	// Bid for a coin listed for auction using funds from the specified wallet.
	// You must have sufficient funds in bare coins; this will throw an exception rather than consuming collectable coins.
	request('POST', [url, '/coin/bid'].join(''), {
		auction: auction,
		amount: amount,
		wallet: walletId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function cancelAuctionOrSale(auction, sale, callback) {
	// Cancel a sale or auction in progress.
	request('POST', [url, '/coin/cancel'].join(''), {
		auction: auction,
		sale: sale,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function cancelBatchAuctionOrSale(batch, callback) {
	// Cancel a batch sale or auction in progress.
	request('POST', [url, '/coin/cancel'].join(''), {
		batch: batch,
		mode: 'auction,sale',
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function splitCoin(coin, split, value, callback) {
	// Split a bare coin into multiple coins of equal value (using the split count) or slice off part
	// of the value into a new coin (using the value parameter). The new coin(s) are returned to the same
	// wallet as the original coin, which is reduced in value by exactly the value of the new coins.

	request('POST', [url, '/coin/split'].join(''), {
		coin: coin,
		split: split,
		value: value,
		token: getToken()
	}, callback);
}

function mergeCoins(coin, coinsList, callback) {
	// Add the value of one or more bare coins to any existing coin.

	request('POST', [url, '/coin/merge'].join(''), {
		coin: coin,
		coinsList: coinsList,
		token: getToken()
	}, callback);
}

function mintCoin({
	name,
	count,
	wallet,
	value,
	face,
	back,
	color,
	textColor,
	pattern,
	patternColor,
	animation,
	mesh,
	nsfw,
	priv,
	royaltiesData,
	meta
}, callback) {
	// Mint a batch of coins.
	// The name is the name that appears on the face of the coin.  The count is the number of coins in the batch,
	// The symbol is a unique identifier for the batch; you can provide this or let the API generate it automatically.
	// coin or coins provides the bare coins that are to be reminted.  They must all be of the same value - specified by the value parameter.
	// You can use merge/split to create a set of suitable blank coins.
	// face and back are the URLs of the image or video to be displayed on the coin. color is the coin color.
	// payload is a JSON payload to be attached to the coins.
	// The resulting coins will be returned to your wallet.
	var data = {
		name: name,
		currency: 1,
		count: count,
		wallet: wallet,
		value: value,
		face: face,
		back: back,
		color: color && color.replace('#', ''),
		text_color: textColor && textColor.replace('#', '') || null,
		nsfw: nsfw || false,
		private: priv || false,
		pattern: pattern,
		pattern_color: pattern ? patternColor && patternColor.replace('#', '') : '',
		animation: animation,
		token: getToken()
	};

	if (count > 1) {
		data.mesh = mesh || true;
	}

	if (royaltiesData) {
		data = _.extend(data, royaltiesData);
	}

	request('POST', [url, '/coin/mint'].join(''), data, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}

		const coins = res.coins;

		if (meta) {
			setMeta('', _.extend({ batch: coins[0].batch }, meta), function (error) {
				callback(error, coins);
			});
		} else {
			return callback(null, coins);
		}
	});
}

function draftCoin(name, count, wallet, value, face, back, color, text_color, pattern, pattern_color, animation, mesh, nsfw, priv, meta, callback) {
	// Draft a batch of coins.
	// The name is the name that appears on the face of the coin.  The count is the number of coins in the batch,
	// The symbol is a unique identifier for the batch; you can provide this or let the API generate it automatically.
	// coin or coins provides the bare coins that are to be reminted.  They must all be of the same value - specified by the value parameter.
	// You can use merge/split to create a set of suitable blank coins.
	// face and back are the URLs of the image or video to be displayed on the coin. color is the coin color.
	// payload is a JSON payload to be attached to the coins.
	// The resulting coins will be returned to your wallet.
	callback = _.last(arguments);

	var data = {
		name: name,
		currency: 1,
		count: count,
		wallet: wallet,
		value: value,
		face: face,
		back: back,
		color: color && color.replace('#', ''),
		text_color: text_color && text_color.replace('#', '') || null,
		nsfw: nsfw || false,
		private: priv || false,
		pattern: pattern,
		pattern_color: pattern ? pattern_color && pattern_color.replace('#', '') : '',
		animation: animation,
		metadata: JSON.stringify(meta),
		token: getToken()
	};

	if (count > 1) {
		data.mesh = mesh || true;
	}

	request('POST', [url, '/coin/draft'].join(''), data, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function draftCoins(page, callback) {
	request('GET', [url, '/coin/drafts'].join(''), {
		page: page || 1,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.drafts);
	});
}

function deleteDraftCoin(draftId, callback) {
	request('POST', [url, '/coin/delete'].join(''), {
		draft: draftId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.draft);
	});
}

function getLeaders(data, callback) {
	request('GET', [url, '/coin/leaders'].join(''), _.extend(data, {
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coins);
	});
}

function checkConnected(user, callback) {
	request('GET', [url, '/rels/connected'].join(''), {
		user: user,
		token: getToken()
	}, callback);
}

function connect(user, callback) {
	request('POST', [url, '/rels/connect'].join(''), {
		user: user,
		token: getToken()
	}, callback);
}

function purchase(amount, wallet, payment_method, payment_currency, payment_amount, callback) {
	// amount (decimal) The amount of Crypto.Kred or other currency to purchase
	// currency (integer) The currency - Crypto.Kred is 1
	// wallet (integer) The target wallet
	// payment_method (string) stripe or coinpayments
	// payment_id (string) If a payment ID is available from Stripe/Coinpayments
	// payment_currency (string) If available at the time
	// payment_amount (decimal) If available at the time
	// discount_code (new) - I'll return you a code along with the other discount details now.
	callback = _.last(arguments);

	request('POST', [url, '/coin/purchase'].join(''), {
		amount: amount,
		currency: 1,
		wallet: wallet,
		payment_method: payment_method,
		payment_currency: payment_currency,
		payment_amount: payment_amount,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.invoice);
	});
}

function likeCoin(coinId, callback) {
	request('POST', [url, '/coin/like'].join(''), {
		coin: coinId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coin);
	});
}

function unlikeCoin(coinId, callback) {
	request('POST', [url, '/coin/unlike'].join(''), {
		coin: coinId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coin);
	});
}

function showCoin(data, callback) {
	request('POST', [url, '/coin/show'].join(''), _.extend(data, {
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coin);
	});
}

function hideCoin(data, callback) {
	request('POST', [url, '/coin/hide'].join(''), _.extend(data, {
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coin);
	});
}

function saveTags(data, callback) {
	///coin=int uuid=string symbol=string sequence=int request=int tags=list mode='add'
	// Add or replace tags on a coin.  Use mode=replace to replace existing tags.
	// You can specify tag= or tags= when using /coins to filter results.
	request('POST', [url, '/coin/tag'].join(''), _.extend({
		token: getToken()
	}, data), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.tag);
	});
}

function topTags(data, callback) {
	//You can also provide a prefix if you just want topic or audience tags:
	//https://api.grab.live/coin/toptags?prefix=audience:
	return request('POST', [url, '/coin/toptags'].join(''), _.extend({
		token: getToken()
	}, data), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.tags);
	});
}

function topUserTags(user, callback) {
	const audienceTags = ['everyone', 'friends', 'fans', 'family', 'customers', 'prospects', 'staff', 'team', 'bloggers', 'empire.kred', 'empirekred'];

	topTags({
		user,
		count: 50
	}, function (error, topTags) {
		if (error) {
			return callback(error);
		}

		const filteredTags = topTags.filter(tag => {
			tag.tag = tag.tag && tag.tag.replace(/^(audience|topic):/, '');
			return audienceTags.indexOf(tag.tag) === -1;
		});

		callback(null, filteredTags);
	});
}

function tagCounts(data, callback) {
	//Will return counts for all tags in use.
	//https://api.grab.live/coin/tagcounts?tags=cattledogs,fun,network
	//You can sort them by name (default) or by count:
	//https://api.grab.live/coin/tagcounts?tags=cattledogs,fun,network&sort=count
	request('POST', [url, '/coin/tagcounts'].join(''), _.extend({
		token: getToken()
	}, data), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.tags);
	});
}

function popularTags(data, callback) {
	//Parameters: prefix (optional), count (default=20)
	request('POST', [url, '/coin/populartags'].join(''), _.extend({
		token: getToken()
	}, data), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.tags);
	});
}

function search(data, callback) {
	request('GET', [url, '/coin/coins'].join(''), _.extend({
		count: data.count || checkIfMobile() ? 10 : 20,
		minted: true,
		nsfw: true,
		flagged: true,
		token: getToken()
	}, data), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coins);
	});
}

function gas(platform, callback) {
	request('GET', [url, '/coin/gas'].join(''), {
		platform: platform,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.gas);
	});
}

function getAddress(platform, callback) {
	request('GET', [url, '/coin/address'].join(''), {
		platform: platform,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.address);
	});
}

function flag(coin, text, callback) {
	request('POST', [url, '/coin/flag'].join(''), {
		coin: coin,
		text: text,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function flags(coin, callback) {
	request('GET', [url, '/coin/flags'].join(''), {
		coin: coin,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.flag);
	});
}

function getSettings(callback) {
	request('GET', [url, '/coin/settings'].join(''), {
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.settings);
	});
}

function updateSettings(data, callback) {
	request('POST', [url, '/coin/settings'].join(''), _.extend(data, {
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.settings);
	});
}

function getLimits(getAll, callback) {
	callback = _.last(arguments);
	request('GET', [url, '/coin/limits'].join(''), {
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		if (!_.isFunction(getAll) && getAll) {
			return callback(null, res);
		}
		return callback(null, res.limits);
	});
}

function coinContacts(callback) {
	request('GET', [url, '/coin/contacts'].join(''), {
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.contacts);
	});
}


function getContacts(data, callback) {
	request('GET', [url, '/contact/find2'].join(''), _.extend(data, {
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.contacts);
	});
}

function canShowcase(callback) {
	request('GET', [url, '/coin/can_showcase'].join(''), {
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function showcase(data, callback) {
	//coin or batch
	request('POST', [url, '/coin/showcase'].join(''), _.extend({
		token: getToken()
	}, data), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function unshowcase(data, callback) {
	//coin or batch
	request('POST', [url, '/coin/unshowcase'].join(''), _.extend({
		token: getToken()
	}, data), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res);
	});
}

function makeCoinPrivate(data, callback) {
	//coin or batch
	request('POST', [url, '/coin/private'].join(''), _.extend({
		token: getToken()
	}, data), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coin);
	});
}

function makeCoinPublic(data, callback) {
	//coin or batch
	request('POST', [url, '/coin/public'].join(''), _.extend({
		token: getToken()
	}, data), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coin);
	});
}

function ledger(data, callback) {
	request('GET', [url, '/coin/ledger2'].join(''), _.extend(data, {
		count: 100,
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.lines);
	});
}

function setMeta(coinId, data, callback) {
	/*
	Required parameter is coin (the coin ID) OR BATCH.

	There are different meta data sets possible here, based on type:

		type = collectible
			description (text)
			link (url)

		type = artist
			description (text)
			video (url)
			photo (url)
			location (text)
			artist (text)
			year (integer)

		type = redeemable
			offer (text)
			redeem (url)

		type = cryptokitty
	 		token (integer)
			generation (integer)
			time (unix time stamp, eg. "1518324751000")
			subtype (text or null)

	*/
	$.ajax({
		type: 'POST',
		dataType: "json",
		contentType: "application/json",
		cache: true,
		url: [url, '/coin/meta'].join(''),
		data: JSON.stringify(_.extend(data, {
			coin: coinId,
			token: getToken()
		})),
		success: function (res) {
			return callback(null, res.meta);
		},
		error: function (res) {
			if (res.status === 500) {
				return callback(null, {
					error: 'Something went wrong. Please try again later.'
				});
			}
			return callback(null, res.responseJSON);
		}
	});
	//request('POST', [url, '/coin/meta'].join(''), _.extend(data, {
	//	coin: coinId,
	//	token: getToken()
	//}), function (error, res) {
	//	if (error || res.error) {
	//		return callback(error || res.error);
	//	}
	//	return callback(null, res.meta);
	//});
}

function deals(callback) {
	request('GET', [url, '/deal/show'].join(''), {
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.deals);
	});
}

function createMarket(data, callback) {
	/*
	 Creates a personal marketplace for a user.  Each user can only have one shop (at least for now).

	 Parameters:
		 name
		 description
		 hero
		 background
		 avatar
	* */
	request('POST', [url, '/coin/market'].join(''), _.extend(data, {
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.market);
	});
}

function listMarkets(data, callback) {
	/*
	 List Markets

	 Parameters:
		 user
		 name
		 search

	 Currently you can only use one of those parameters.  I can expand this function as needed.
	 /shops with no parameters will return the current user's shop (if they have one).

	 * */
	request('GET', [url, '/coin/markets'].join(''), _.extend(data, {
		token: getToken()
	}), function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.markets);
	});
}

function addToMarket(coinId, callback) {
	/*
	 List a coin for sale in your shop

	 Parameters:
	 	coin

	 This will complain appropriately if:
	 - The user hasn't created a shop.
	 - The coin is already in the shop.
	 - The coin doesn't exist.
	 - The coin is not for sale.  (You can only list coins once the current owner lists them for sale.
	   I can change that if it interferes with anything we want to do.)

	 * */
	request('POST', [url, '/coin/listing'].join(''), {
		coin: coinId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.markets);
	});
}

function removeFromMarket(coinId, callback) {
	/*
	 Remove a coin listing from your shop

	 Parameters:
	 	coin
	 Will complain if the coin is not listed in the shop, or doesn't exist.

	 * */
	request('GET', [url, '/coin/unlist'].join(''), {
		coin: coinId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.markets);
	});
}

function redeem(coinId, callback) {
	request('GET', [url, '/coin/redeem'].join(''), {
		coin: coinId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coin);
	});
}

function unredeem(coinId, callback) {
	request('GET', [url, '/coin/redeem'].join(''), {
		coin: coinId,
		token: getToken()
	}, function (error, res) {
		if (error || res.error) {
			return callback(error || res.error);
		}
		return callback(null, res.coin);
	});
}

export {
	api,

	userSetup,

	openWallet,
	getWallets,
	getWalletsWithoutCheckingLimits,
	getWallet,
	held,
	remind,
	getWalletCoins,
	getUserCoins,

	getCoin,
	getBatchSummary,

	sellCoin,
	surrenderCoin,
	sendCoin,
	giftCoin,
	holdCoin,
	collectCoin,
	requestCoin,
	buyCoin,
	giveawayCoin,
	giveaways,
	claimCoin,

	auctionCoin,
	bidOnCoin,
	cancelAuctionOrSale,
	cancelBatchAuctionOrSale,

	getCoinHistory,
	getCoinOwners,
	getMarket,
	getSales,
	getAuctions,
	getRequests,
	getFreshRequests,
	getBalance,

	splitCoin,
	mergeCoins,
	mintCoin,
	draftCoin,
	draftCoins,
	deleteDraftCoin,
	getLeaders,

	checkConnected,
	connect,

	purchase,

	likeCoin,
	unlikeCoin,

	hideCoin,
	showCoin,

	saveTags,
	topTags,
	topUserTags,
	tagCounts,
	popularTags,

	search,
	gas,
	getAddress,
	flag,
	flags,

	getSettings,
	updateSettings,

	getLimits,
	limits,
	requireCanHoldTokens,

	coinContacts,
	getContacts,

	canShowcase,
	showcase,
	unshowcase,

	makeCoinPrivate,
	makeCoinPublic,

	ledger,

	setMeta,

	deals,

	createMarket,
	listMarkets,
	addToMarket,
	removeFromMarket,

	redeem,
	unredeem
};

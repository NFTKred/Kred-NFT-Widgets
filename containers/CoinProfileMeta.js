import React from 'react';
import ReactPlayer from 'react-player';
import _ from 'underscore';
import '../css/coinProfileMeta';
import {getDateString} from '../js/helpers';
import {redeem, unredeem} from '../js/grab';

export class CoinProfileMeta extends React.Component {
	redeemOffer(coin) {
		redeem(coin.coin, function (error, res) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$(document.body).trigger('messenger:show', ['message', 'This offer has been redeemed!']);
			window.open(coin.meta && coin.meta.redeem,'_blank');
		});
	}

	unredeemOffer(coin) {
		unredeem(coin.coin, function (error, res) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			$(document.body).trigger('messenger:show', ['message', 'This offer has been unredeemed!']);
		});
	}

	getCoinDetails(metaType) {
		switch (metaType) {
			case 'cryptokitty':
				return CryptoKittyCoinDetails;
			case 'collectible':
				return CollectibleCoinDetails;
			case 'redeemable':
				return RedeemableCoinDetails;
			case 'artist':
				return ArtistCoinDetails;
		}
		console.warn(`Unknown coin meta type: ${metaType}`);
	}

	render() {
		const { coin, isOwner, isCreator } = this.props;
		const coinMeta = coin.meta;

		if (
			_.isEmpty(coin) ||
			!_.reject(coinMeta, function(meta) {
				return !meta;
			}).length
		) {
			return;
		}

		const CoinDetails = this.getCoinDetails(coinMeta.type);

		if (CoinDetails) {
			return (
				<div className="coinprofile-meta">
					<CoinDetails coin={coin} isOwner={isOwner} isCreator={isCreator}
						redeemOffer={this.redeemOffer}
						unredeemOffer={this.unredeemOffer}
					/>
				</div>
			);
		}
	}
}

function CollectibleCoinDetails({ coin }) {
	const { description, link } = coin.meta;

	if (!description && !link) {
		return;
	}

	return (
		<div>
			<h4>About</h4>
			<CoinDetailText text={description} />
			<CoinDetailLink link={link} />
		</div>
	);
}

function RedeemableCoinDetails({ coin, isOwner, isCreator, redeemOffer, unredeemOffer }) {
	const { offer, redeem } = coin.meta;

	if (!offer && !redeem) {
		return;
	}

	return (
		<div>
			<h4>Offer</h4>
			<CoinDetailText text={offer} />
			{!!coin.redeemed && (
				<div>
					<p><strong>Redeemed on: </strong> {getDateString(new Date(coin.redeemed).getTime() / 1000)}</p>
					{isCreator && (
						<button
							onClick={() => unredeemOffer(coin)}
							className="btn btn-primary btn-block btn-sm"
						>
							Unredeem
						</button>
					)}
				</div>

			)}
			{!coin.redeemed && redeem && isOwner ? (
				<button
					onClick={() => redeemOffer(coin)}
					className="btn btn-primary btn-block btn-sm"
				>
					Redeem
				</button>
			) : null}
		</div>
	);
}

function ArtistCoinDetails({ coin }) {
	const { name, meta } = coin;
	const { description, video, photo, location, year, artist } = meta;

	if (!description && !video && !photo && !location && !year && !artist) {
		return;
	}

	return (
		<div>
			<h4>About</h4>
			<CoinDetailText text={description} />
			{video ? (
				<div className="player-wrapper">
					<ReactPlayer
						className="react-player"
						url={video}
						width="100%"
						height="100%"
					/>
				</div>
			) : null}
			{photo ? (
				<img
					src={photo}
					alt={name}
					styles={{
						width: '100%'
					}}
				/>
			) : null}
			<CoinDetail label="Location" value={location} />
			<CoinDetail label="Year" value={year} />
			<CoinDetail label="Artist" value={artist} />
		</div>
	);
}

function CryptoKittyCoinDetails({ coin }) {
	const { id, generation, time, subtype } = coin.meta;

	if (!id && !generation && !time && !subtype) {
		return;
	}

	return (
		<div>
			<h4>About</h4>
			<CoinDetail label="Kitty ID" value={id} />
			<CoinDetail label="Generation" value={generation} />
			<CoinDetail
				label="Born"
				value={getDateString(time)}
			/>
			<CoinDetailLink
				link={`https://www.cryptokitties.co/kitty/${id}`}
			/>
			<CoinDetail label="Fancy" value={subtype} />
		</div>
	);
}

function CoinDetail({ label, value }) {
	if (value) {
		return (
			<p>
				<strong>{label}:</strong> {value}
			</p>
		);
	}
}

function CoinDetailText({ text }) {
	if (text) {
		return <p>{text}</p>;
	}
}

function CoinDetailLink({ link }) {
	if (link) {
		return (
			<a href={link} target="_blank">
				<i className="fas fa-link" style={{marginRight:'0.5em'}}/>{link}
			</a>
		);
	}
}

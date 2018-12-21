import React, { Component } from 'react';
import KredCoin from 'cryptokred-coin';
import 'cryptokred-coin/src/coin.css';
import { create } from 'domain';

const regExpImageUrl = /(avatars.io|avatars.socialos.net|imgcdn.socialos.io\/avatars\/socialos|graph.facebook.com|media.licdn.com|empire.kred|twitter.com|s3.amazonaws.com\/empireavenue-public\/portraits|(^data:image|\.(jpe?g|png|gif|svg)$))/i;
const regExpGifUrl = /\.gif$/i;

export function isVideoURL(url) {
	return !regExpImageUrl.test(url);
}

export default class Coin extends Component {
	componentDidMount() {
		this.renderCoin(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (this.shouldComponentUpdate(nextProps)) {
			this.renderCoin(nextProps);
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return (
			!!nextProps.refresh ||
			nextProps.width !== this.props.width ||
			nextProps.id !== this.props.id ||
			nextProps.image !== this.props.image ||
			nextProps.upperText !== this.props.upperText ||
			nextProps.lowerText !== this.props.lowerText ||
			nextProps.textColor !== this.props.textColor ||
			nextProps.backgroundColor !== this.props.backgroundColor ||
			nextProps.pattern !== this.props.pattern ||
			nextProps.patternColor !== this.props.patternColor ||
			nextProps.animation !== this.props.animation ||
			!!nextProps.displayCoin
		);
	}

	renderCoin({
		image,
		width,
		upperText,
		lowerText,
		textColor,
		backgroundColor,
		pattern,
		patternColor,
		animation,
		displayCoin,
	}) {
		const isVideo = isVideoURL(image);
		const isImage = !isVideo;
		const isGif = regExpGifUrl.test(image);

		const container = createHiddenContainer(width);

		let thumbnail;

		if (isImage) {
			thumbnail = image;

			if (isGif && !displayCoin) {
				if (image.match(/imgcdn\.socialos\.io/)) {
					thumbnail = image.replace(/\.gif$/, '-frame1.jpg');
				} else if (image.match(/giphy\.com\/media/)) {
					thumbnail = image.replace(/200\.gif$/, '200_s.gif');
				}
			}

			if (image.match(/imgcdn\.socialos\.io/)) {
				if (width * 0.67 > 200) {
					thumbnail += '/medium';
				} else {
					thumbnail += '/small';
				}
			} else if (image.match(/s3.amazonaws.com\/empireavenue-public\/portraits/)) {
				if (!image.match(/\.(jpg|png)$/)) {
					thumbnail = image.replace(/jpg$/, '.jpg').replace(/png$/, '.png');
				}
			} else if (image.match('https://30p8ypma69uhv.cloudfront.net')) {
				thumbnail = image.replace('30p8ypma69uhv', 'd30p8ypma69uhv');
			}

			if (thumbnail.match('http://')) {
			 thumbnail = thumbnail.replace('http://', 'https://');
		 }
		}

		const coin = new KredCoin(
			{
				container,
				image: thumbnail,
				video: isVideo ? image : '',
				width,
				upperText:
					upperText && upperText.substring(0, 22).toUpperCase(),
				lowerText,
				textColor: textColor ? '#' + textColor.replace('#', '') : '',
				backgroundColor: backgroundColor
					? '#' + backgroundColor.replace('#', '')
					: '',
				pattern,
				patternColor: patternColor
					? '#' + patternColor.replace('#', '')
					: '',
				animation,
			},
			() =>
				requestAnimationFrame(() => {
					if (coin === this.coinPending) {
						this.swapCoins(coin);
					}

					document.body.removeChild(container);
				})
		);

		this.coinPending = coin;
	}

	swapCoins(coin) {
		if (this.coin) {
			try {
				this.coin.destroy();
			} catch (e) {
				console.warn('Failed to destroy coin', this.coin, e);
			}
		}

		if (!this.container) {
			return;
		}

		this.container.appendChild(coin.root);
		this.coin = coin;

		// This fixes a "broken" autoplay in Chrome
		// Not sure why the video doesn't actually autoplay
		const video = coin.root.querySelector('video');
		if (video && video.paused) {
			video.play();
		}
	}

	onHover(event) {
		if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
			return;
		}
		//Hover to play GIF
		var $coin = $(event.target).closest('.coin-wrapper'),
			$href = $coin.find('.coin-image image').attr('xlink:href');

		if ($href && $href.match(/-frame1\.jpg/)) {
			$coin
				.find('.coin-image image')
				.attr('xlink:href', this.props.image);
		} else if (
			$href &&
			$href.match(/giphy\.com\/media/) &&
			$href.match(/200_s\.gif/)
		) {
			$coin
				.find('.coin-image image')
				.attr('xlink:href', this.props.image);
		}
	}

	render() {
		const { image, id } = this.props;
		return (
			<div
				className={
					'coin-wrapper' +
					(image && image.match('img.cn.cryptokitties.co')
						? ' kitty-coin'
						: '')
				}
				onMouseOver={this.onHover.bind(this)}
				data-coin-id={id}
				ref={div => (this.container = div)}
			/>
		);
	}
}

function createHiddenContainer(width) {
	const container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.left = '-9999px';
	container.style.width = width + 'px';
	document.body.appendChild(container);
	return container;
}

const coinPlaceholderCache = {};

function getPlaceholderHTML(width) {
	if (width in coinPlaceholderCache) {
		return coinPlaceholderCache[width];
	}

	const container = createHiddenContainer(width);

	new KredCoin(
		{
			container,
			width,
			upperText: '',
			lowerText: '',
			textColor: '#FFFFFF',
			backgroundColor: '#FFFFFF',
		},
		() => {
			coinPlaceholderCache[width] = container.innerHTML;
			document.body.removeChild(container);
		}
	);

	// use an empty string for the first response
	return '';
}

// warm up cache with known widths
getPlaceholderHTML(215);

export function CoinPlaceholder({ width }) {
	return (
		<div dangerouslySetInnerHTML={{ __html: getPlaceholderHTML(width) }} />
	);
}

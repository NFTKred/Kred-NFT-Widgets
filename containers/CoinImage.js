import React from 'react';
import { isVideoURL } from './Coin';

export function CoinImage({ coin, side, alt, ...attrs }) {
	var image = side === 'back' ? coin.back : coin.face;
	if (isVideoURL(image)) {
		return (
			<video autoplay loop muted playsinline {...attrs} title={alt}>
				<source src={coin.face} />
			</video>
		);
	}
	return <img src={image} alt={alt} {...attrs} />;
}

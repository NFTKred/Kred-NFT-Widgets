import React, { Component } from 'react';
import { CollectionTemplate } from './CollectionTemplate';
import { InfiniteScroll } from './InfiniteScroll';
import { api } from '../js/grab';
import Coins from './Coins';

export class DesignCollection extends Component {
	renderDesigns(coins) {
		if (!coins) {
			return null;
		}

		if (coins.length) {
			return <Coins coins={coins} />;
		}
	}

	render() {
		return (
			<CollectionTemplate title="Saved Designs" backButton={true}>
				<InfiniteScroll
					key="designs"
					itemsPerPage={20}
					load={page =>
						api('GET', '/coin/drafts', 'drafts', {
							sort: '-created',
							count: 20,
							page,
						})
					}
					render={coins => this.renderDesigns(coins)}
				/>
			</CollectionTemplate>
		);
	}
}

import React from 'react';

import { CoinCategory } from './CoinCategory';

import _ from 'underscore';
import '../css/categorycoins';

const DEFAULT_SORT_CATEGORIES = [
	{
		id: 1,
		title: 'Popular',
		type: 'sort',
		value: '-likes'
	},
	{
		id: 2,
		title: 'Recently Minted',
		type: 'sort',
		value: '-created'
	},
	{
		id: 3,
		title: 'Most Circulated',
		type: 'sort',
		value: '-circulation'
	},
	{
		id: 4,
		title: 'Other popular coins',
		type: 'sort',
		value: '-likes'
	}
];

class CategoryCoins extends React.Component {
	state = {
		windowWidth: $(window).width()
	};
	
	getSortCategories() {
		let sortCategories =
			this.props.sortCategories || DEFAULT_SORT_CATEGORIES;

		return _.filter(sortCategories, function (category) {
			return !!category.value && !!category.title;
		});
	}
	componentDidMount() {
		window.addEventListener('resize', () => this.resize());
	}
	resize() {
		this.setState({
			windowWidth: $(window).width()
		});
	}
	getChunkSize() {
		const { windowWidth } = this.state;

		if (windowWidth <= 576) {
			return 1;
		}

		if (windowWidth <= 768) {
			return 2;
		}

		if (windowWidth <= 992) {
			return 3;
		}

		return 4;
	}
	render() {
		const { isLoading } = this.state;
		const chunkSize = this.getChunkSize();

		if (isLoading) {
			return;
		}

		return (
			<div className="categorycoins-container">
				{this.getSortCategories().map(category => (
				<CoinCategory
					key={category.id}
					category={category}
					numVisibleCoins={chunkSize}
					{...this.props}
				/>))}
			</div>
		);
	}
}

export default CategoryCoins;

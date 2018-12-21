import React, { Component } from 'react';
import { Link } from './Link';
import { chunk } from 'underscore';
import Coins from './Coins';
import { search } from '../js/grab';
import { checkIfMobile } from '../js/helpers';
import { getUser } from '../js/auth';

export class CoinCategory extends Component {
	state = {
		isLoading: true,
		coins: []
	};

	numTotalCoins = checkIfMobile() ? 10 : 20;

	componentDidMount() {
		var _this = this;

		_this.addTouchEvents();

		$(document.body).on('coinAction:done', function(event) {
			_this.loadData();
		});

		_this.loadData();
	}
	loadData() {
		// first we load only visible coins
		this.getCoins(this.props.numVisibleCoins, (error, coins) => {
			if (error) {
				return $(document.body).trigger('messenger:show', [
					'error',
					error
				]);
			}

			this.setState({ coins });

			// now, go ahead and load all the coins we want
			this.getCoins(this.numTotalCoins, (error, coins) => {
				this.setState({
					isLoading: false
				});

				if (coins) {
					this.setState({ coins });
				}
			});
		});
	}
	getCoins(count, callback) {
		const { category } = this.props;

		const data = {
			status: 'active',
			batched: true,
			showcase: 'sort',
			user: this.props.userId || ''
		};

		data[category.type] = category.value;

		if (category.type === 'tag') {
			data.sort = '-created';
		}

		data.count = count;

		return search(data, callback);
	}
	addTouchEvents() {
		const { category } = this.props;

		const $carousel = $(`#categoryCarousel${category.id}`);

		let touchStartX = null;

		$carousel
			.on('touchstart', function(event) {
				var e = event.originalEvent;
				if (e.touches.length == 1) {
					var touch = e.touches[0];
					touchStartX = touch.pageX;
				}
			})
			.on('touchmove', function(event) {
				var e = event.originalEvent;
				if (touchStartX != null) {
					var touchCurrentX = e.changedTouches[0].pageX;
					if (touchCurrentX - touchStartX > 60) {
						touchStartX = null;
						$carousel.carousel('prev');
					} else if (touchStartX - touchCurrentX > 60) {
						touchStartX = null;
						$carousel.carousel('next');
					}
				}
			})
			.on('touchend', function() {
				touchStartX = null;
			});
	}
	render() {
		const {
			category,
			numVisibleCoins,
			viewBatch,
			path
		} = this.props;

		const { coins, isLoading } = this.state;

		const renderCoins = isLoading
			? coins.concat(getPlaceholderCoins(Math.max(0, this.numTotalCoins - coins.length)))
			: coins;

			if (!isLoading && !coins.length) {
				return;
			}

			return (
			<div
				className={`carousel-container ${
					isLoading ? 'coin-category-placeholders' : ''
				}`}
			>
				<h2 className="text-capitalize">
					<CategoryLink category={category} path={path}/>
				</h2>
				<div
					id={`categoryCarousel${category.id}`}
					className="carousel slide w-100"
					data-interval="false"
				>
					<div
						className="carousel-inner w-100"
						role="listbox"
						style={{ minHeight: '307px' }}
					>
						{chunk(renderCoins, numVisibleCoins).map(
							(coins, index) => (
								<Coins
									key={index}
									coins={coins}
									path="category"
									className={`carousel-item ${
										index == 0 ? 'active' : ''
									}`}
									batched={true}
									viewBatch={viewBatch}
								/>
							)
						)}
					</div>
					<a
						className="carousel-control-prev"
						href={'#categoryCarousel' + category.id}
						role="button"
						data-slide="prev"
					>
						<i className="fas fa-angle-left" />
						<span className="sr-only">Previous</span>
					</a>
					<a
						className="carousel-control-next"
						href={'#categoryCarousel' + category.id}
						role="button"
						data-slide="next"
					>
						<i className="fas fa-angle-right" />
						<span className="sr-only">Next</span>
					</a>
				</div>
			</div>
		);
	}
}

function CategoryLink({ category, path }) {
	return (
		<a
			href={
				category.path ||
				(path
					? path
						: '/marketplace/all') +
					'/' +
					category.type +
					'/' +
					category.value
			}
			title={category.title}
		>
			{category.title}
			<i className="fas fa-angle-right" />
		</a>
	);
}

function getPlaceholderCoins(count) {
	return Array.from(Array(count)).map(index => ({
		placeholder: true
	}));
}

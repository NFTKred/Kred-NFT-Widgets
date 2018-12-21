import React, { Component } from 'react';
import { Spinner } from './Spinner';

export class InfiniteScroll extends Component {
	state = {
		page: 0,
		items: null,
		isLoading: true,
		isAtTheBottom: false,
	};

	componentDidMount() {
		this._onScroll = () => this.onScroll();
		window.addEventListener('scroll', this._onScroll);

		this.loadPage(1);
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this._onScroll);
	}

	async loadPage(page) {
		const { load, itemsPerPage = 1 } = this.props;

		this.setState({ page, isLoading: true });

		try {
			const pageItems = await load(page);
			const isFullPage = pageItems && pageItems.length >= itemsPerPage;

			if (pageItems) {
				this.setState(
					({ items }) => ({
						items: (items || []).concat(pageItems),
					}),

					// after the items render, check scroll
					() => this.onScroll()
				);
			}

			if (!isFullPage) {
				this.setState({
					isAtTheBottom: true,
				});
			}
		} catch (e) {
			console.error(e);

			this.setState({
				isAtTheBottom: true,
			});
		}

		this.setState({ isLoading: false });
	}

	onScroll() {
		const { height = 650 } = this.props;
		const { isLoading, isAtTheBottom } = this.state;

		if (!isLoading && !isAtTheBottom) {
			const scrollTop = $(window).scrollTop() + $(window).height();
			const documentHeight = $(document).height();

			if (scrollTop >= documentHeight - height) {
				this.loadPage(this.state.page + 1);
			}
		}
	}

	render() {
		const { loading = <Spinner />, children, render } = this.props;
		const { isLoading, items } = this.state;

		const renderFunction = render || children;

		return (
			<div>
				{renderFunction(items)}
				{isLoading && loading}
			</div>
		);
	}
}

export class InfiniteScrollComponent extends Component {
	constructor(props) {
		super(props);

		this.pageLoadSuccessCount = 0;

		this.state = {
			infiniteScrollPages: [1],
			infiniteScrollPageItems: [],
			infiniteScrollItems: [],
		};

		console.warn(
			'InfiniteScrollComponent is deprecated, please use InfiniteScroll instead'
		);
	}

	componentWillReceiveProps() {
		this.pageLoadSuccessCount = 0;
		this.setPagesToDisplay(1);
	}

	componentDidMount() {
		this._onScroll = () => this.onScroll();
		window.addEventListener('scroll', this._onScroll);
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this._onScroll);
	}

	onPageSuccess(page, pageItems) {
		if (this.state.infiniteScrollPageItems[page] !== pageItems) {
			const infiniteScrollPageItems = this.state.infiniteScrollPageItems;
			infiniteScrollPageItems[page] = pageItems;

			this.setState({
				infiniteScrollPageItems,
				infiniteScrollItems: infiniteScrollPageItems.reduce(
					(items, pageItems) => items.concat(pageItems),
					[]
				),
			});
		}

		if (page > this.pageLoadSuccessCount) {
			this.pageLoadSuccessCount = page;
		}
	}

	setPagesToDisplay(pageCount) {
		if (pageCount !== this.state.infiniteScrollPages.length) {
			this.setState({
				infiniteScrollPages: Array.from(Array(pageCount)).map(
					(_, index) => index + 1
				),
			});
		}
	}

	onScroll() {
		const scrollTop = $(window).scrollTop() + $(window).height();
		const documentHeight = $(document).height();

		if (scrollTop >= documentHeight - 650) {
			this.setPagesToDisplay(this.pageLoadSuccessCount + 1);
		}
	}
}

import React, { Component } from 'react';
import _ from 'underscore';
import { CollectionTemplate } from './CollectionTemplate';
import { InfiniteScroll } from './InfiniteScroll';
import Coins from './Coins';
import { api } from '../js/grab';
import { getUserID } from '../js/auth';
import { Spinner } from './Spinner';

export class BatchCollection extends Component {
	state = {
		count: null,
		rerender: false
	};

	async componentDidMount() {
		var _this = this;
	_this.setState({
			count: await this.getBatchCount(),
		});

		$(document.body).on('coinAction:done', (event) => {
			_this.setState({
				rerender: _.random(1, 999)
			});
		});
	}

	async getBatchCount() {
		const { user, batch } = this.props;

		const [coin] = await api('GET', '/coin/coins', 'coins', {
			count: 1,
			user,
			batch,
			batched: true,
		});

		return coin.coins;
	}

	renderTemplate(coins) {
		if (!coins) {
			return (
				<CollectionTemplate backButton={true}>
					<Spinner />
				</CollectionTemplate>
			);
		}

		if (!coins.length) {
			return (
				<CollectionTemplate title="Batch not found" backButton={true} />
			);
		}

		const { count } = this.state;
		const isOwner = coins[0].user === getUserID();

		if (isOwner) {
			return <OwnerBatchCollection coins={coins} count={count} />;
		}

		return <ViewerBatchCollection coins={coins} count={count} />;
	}

	render() {
		const { batch, user } = this.props;
		const { rerender } = this.state;
		return (
			<InfiniteScroll
				key={JSON.stringify({ batch, user, rerender })}
				load={page =>
					api('GET', '/coin/coins', 'coins', {
						batched: false,
						hidden: true,
						page,
						user,
						batch,
						count: 20,
					})
				}
				itemsPerPage={20}
				render={coins => this.renderTemplate(coins)}
			/>
		);
	}
}

function ViewerBatchCollection({ coins, count }) {
	return (
		<CollectionTemplate
			backButton={true}
			title={
				<span>
					{coins[0].name}
					<BatchCount count={count} />
				</span>
			}
		>
			<Coins coins={coins} />
		</CollectionTemplate>
	);
}

class OwnerBatchCollection extends Component {
	state = {};

	render() {
		const { coins, count } = this.props;

		return (
			<CollectionTemplate
				backButton={true}
				title={
					<span>
						{coins[0].name}

						<BatchCount count={count} />

						<i
							data-testid="togglesettings"
							className="fas fa-cog"
							title="Toogle Settings"
							style={{
								cursor: 'pointer',
								marginLeft: '10px',
							}}
							onClick={() => this.toggleSettings()}
						/>
					</span>
				}
			>

				<Coins coins={coins} />
			</CollectionTemplate>
		);
	}
}

function BatchCount({ count }) {
	if (!count) {
		return null;
	}

	return <span className="badge badge-pill badge-light">{count} coins</span>;
}

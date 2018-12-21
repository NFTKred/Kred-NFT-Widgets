import React from 'react';
import async from 'async';
import _ from 'underscore';
import {round} from '../js/helpers';
import {ledger} from '../js/grab';

import Coin from './Coin';

import '../css/transactionHistoryModal';

const TransactionHistoryModal = React.createClass({
	getInitialState() {
		return {
			isLoading: true,
			lines: [],
			linesLoaded: false,
			page: 1
		};
	},
	componentDidMount: function () {
		var _this = this;
		$('.transactionhistory-modal').on('hidden.bs.modal', function (e) {
			this.remove();
		});

		$('.transactionhistory-modal .transaction-container').on('scroll', this.onScroll);
	},
	componentWillMount: function () {
		var _this = this;
		_this.setState({isLoading: true});
		return ledger({
			page: _this.state.page
		}, function (error, lines) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			_this.setState({
				isLoading: false,
				lines: lines
			});
		});
	},
	onScroll(event) {
		var _this = this,
			$container = $('.transaction-container');

		if ($container.scrollTop() + $container.height() >= ($container.height() - 300) && !_this.state.linesLoaded) {
			if (_this.state.isLoading) {
				return;
			}

			_this.setState({
				isLoading: true,
				page: _this.state.page + 1
			});

			return ledger({
				page: _this.state.page
			}, function (error, lines) {
				_this.setState({
					isLoading: false
				});
				if (error) {
					return $(document.body).trigger('messenger:show', ['error', error]);
				}

				_this.setState({
					linesLoaded: lines.length < 100,
					lines: _this.state.lines.concat(lines)
				});
			});
		}
	},
	linkDescription(line) {
		var description = line.description;
		if (line.coin) {
			var url = '/coin/' + line.symbol + '/' + line.sequence;
			description = description.replace(line.name, '<a href="' + url + '" target="_blank">' + line.name + '</a>');
		}
		return description;
	},
	render: function () {
		const {loggedInUser} = this.props;
		const {lines, isLoading} = this.state;

		return (
			<div className="transactionhistory-modal modal fade">
				<div className="vertical-alignment-helper">
					<div className="modal-dialog modal-lg vertical-align-center">
						<div className="modal-content">
							<div className="modal-header">
								<h4 className="modal-title">Transaction History</h4>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div className="modal-body">
								<table className="transaction-table">
									<thead className="transaction-header">
										<tr>
											<th>Transaction</th>
											<th>Collection</th>
											<th>Balance</th>
										</tr>
									</thead>
									<tbody className="transaction-container">
										{isLoading ? (<tr class="text-center" style={{padding: '15px 0'}}>
											<td colspan="3"><i className="fas fa-2x fa-spin fa-spinner"></i></td>
										</tr>) : null}
										{lines.map((line, index) => {
											return (
												<tr className="transaction-item">
													<td dangerouslySetInnerHTML={{__html: this.linkDescription(line)}}></td>
													<td>{round(line.after.collection, 2)} CƘr&nbsp;
															{line.collection_adj > 0 ? (
																<span className="text-success">
																	<i className="fas fa-angle-up"></i> {round(Math.abs(line.collection_adj), 2)}</span>
															) : null}
															{line.collection_adj < 0 ? (
																<span className="text-danger">
																	<i className="fas fa-angle-down"></i> {round(Math.abs(line.collection_adj), 2)} </span>
															) : null}
													</td>
													<td>{round(line.after.balance, 2)} CƘr&nbsp;
															{line.balance_adj > 0 ? (
																<span className="text-success">
																	<i className="fas fa-angle-up"></i> {round(Math.abs(line.balance_adj), 2)}</span>
															) : null}
															{line.balance_adj < 0 ? (
																<span className="text-danger">
																	<i className="fas fa-angle-down"></i> {round(Math.abs(line.balance_adj), 2)} </span>
															) : null}
													</td>
												</tr>
											)
										})}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
});

export default TransactionHistoryModal;
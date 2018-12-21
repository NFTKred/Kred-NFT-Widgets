import React, { Component } from 'react';
import _ from 'underscore';

import { getCoinHistory } from '../js/grab';
import { round } from '../js/helpers';

class CoinValue extends Component {
	constructor() {
		super();

		this.state = {
			showChart: true
		};
	}

	componentDidMount() {
		this.renderChat(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.coin.coin !== this.props.coin.coin) {
			this.setState({
				showChart: true
			});
			this.renderChat(nextProps);
		}
	}

	async renderChart() {
		if (this.state.chart) {
			return this.state.chart;
		}

		const { Highcharts } = await import('../js/vendor/highcharts');

		const chart = Highcharts.chart('coinprofile-graph', {
			chart: {
				height: '150px',
				backgroundColor: 'rgba(255, 255, 255, 1)'
			},
			title: { text: null },
			exporting: { enabled: false },
			tooltip: {
				enabled: true,
				backgroundColor: 'rgba(80, 80, 80, 1)',
				style: {
					color: '#ffffff'
				},
				borderRadius: 5,
				padding: 5,
				formatter: function() {
					return (
						new Date(this.x).toLocaleDateString() +
						' - ' +
						this.y +
						' CƘr'
					);
				}
			},
			plotOptions: {
				area: {
					enableMouseTracking: true,
					color: 'rgba(0, 123, 255, 0.3)',
					fillColor: {
						linearGradient: {
							x1: 0,
							y1: 0,
							x2: 0,
							y2: 1
						},
						stops: [
							[0, 'rgba(0, 123, 255, 0.5)'],
							[
								1,
								Highcharts.Color('rgba(0, 123, 255, 0.8)')
									.setOpacity(0.1)
									.get('rgba')
							]
						]
					},
					marker: {
						radius: 0
					},
					lineWidth: 1,
					states: {
						hover: {
							lineWidth: 1
						}
					},
					threshold: null
				}
			},
			legend: { enabled: false },
			xAxis: {
				gridLineWidth: 1,
				title: { enabled: false },
				type: 'datetime',
				ordinal: true,
				visible: true,
				tickLength: 0,
				labels: {
					enabled: false
				}
			},
			yAxis: {
				title: { text: null },
				startOnTick: true,
				endOnTick: true,
				labels: {
					enabled: false
				},
				min: 0,
				minRange: 2,
				gridLineWidth: 0
			},
			series: [
				{
					type: 'area',
					pointInterval: 1000 * 3600,
					dataLabels: {
						overflow: false
					}
				}
			],
			credits: {
				enabled: false
			},
			responsive: {
				rules: [
					{
						condition: {
							maxWidth: 500
						},
						chartOptions: {
							legend: {
								align: 'center',
								verticalAlign: 'bottom',
								layout: 'horizontal'
							},
							credits: {
								enabled: false
							}
						}
					}
				]
			}
		});

		this.setState({ chart });

		return chart;
	}

	renderChat(props) {
		var coin = props.coin,
			data = [[new Date(coin.created).getTime(), round(coin.value, 2)]];

		if (coin && !coin.coin) {
			return;
		}

		getCoinHistory(coin.coin, '', async (error, history) => {
			if (error) {
				return $(document.body).trigger('messenger:show', [
					'error',
					error
				]);
			}
			data = data.concat(
				_.compact(
					_.map(history, function(history) {
						if (
							(history.price || history.value) &&
							(history.action === 'buy' ||
								history.action === 'bid')
						) {
							return [
								new Date(history.time).getTime(),
								round(history.price || history.value, 2)
							];
						}
					})
				)
			);

			if (data && data.length <= 1) {
				this.setState({
					showChart: false
				});
			} else {
				const chart = await this.renderChart();

				chart.series[0].update(
					{
						data: data
					},
					true
				);
			}
		});
	}

	render() {
		const { showChart } = this.state;
		return (
			<div className={'coinprofile-value' + (showChart ? '' : ' hide')}>
				<h4>Sale History</h4>
				<div id="coinprofile-graph" />
			</div>
		);
	}
}

export default CoinValue;

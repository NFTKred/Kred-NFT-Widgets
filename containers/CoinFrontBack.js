import React, { Component } from 'react';
import Coin from './Coin';

import { round } from '../js/helpers'

class CoinFrontBack extends Component {
	constructor(props) {
		super(props);

		this.state = {
			nsfw: this.props.coin.nsfw || this.props.coin.flagged || 0
		};
	}
	shouldComponentUpdate(nextProps, nextState) {
		return !!nextProps.refresh ||
			nextState.width !== this.props.width ||
			nextState.nsfw !== this.state.nsfw ||
			nextProps.coin.coin !== this.props.coin.coin ||
			nextProps.coin.face !== this.props.coin.face ||
			nextProps.coin.name !== this.props.coin.name ||
			nextProps.coin.color !== this.props.coin.color ||
			nextProps.coin.text_color !== this.props.coin.text_color ||
			nextProps.coin.pattern !== this.props.coin.pattern ||
			nextProps.coin.pattern_color !== this.props.coin.pattern_color ||
			nextProps.coin.domain !== this.props.coin.domain ||
			nextProps.coin.animation !== this.props.coin.animation ||
			nextProps.coin.back !== this.props.coin.back ||
			nextProps.coin.nsfw !== this.props.coin.nsfw ||
			!!nextProps.displayCoin;
	}
	componentDidUpdate(prevProps) {
		var _this = this;
		if (prevProps.coin.nsfw !== _this.props.coin.nsfw) {
			_this.setState({
				nsfw: this.props.coin.nsfw || this.props.coin.flagged || 0
			});
		}
	}
	toggleNSFW(event) {
		this.setState({
			nsfw: !this.state.nsfw
		});
	}
	render() {
		const {
			width,
			coin,
			id,
			kitty,
			refresh,
			onUpdateName,
			onUpdateFrontImage,
			onUpdateBackImage,
			displayCoin
			}  = this.props;
		const {
			nsfw
			} = this.state;

		const frontWidth = width * 0.7;

		return <div className="coinfrontback-container" style={{
			width: width,
			height: frontWidth,
			position: 'relative',
			margin: 'auto'
		}}>
			<div className={'front-coin' + (!!nsfw ? 'nsfw-filter' : '')}>
				{!!kitty ? (
					<div className="kitty-overlay">
						<span className="edit-coin-name" title="Edit Coin name" onClick={onUpdateName}><i className="fas fa-edit"></i></span>
						<span>
							<i className="fas fa-cloud-upload-alt fa-4x" onClick={onUpdateFrontImage} style={{
								opacity: 0.8,
								color: '#fff',
								cursor: 'pointer'
							}}></i>
						</span>
					</div>
				) : null}
				<Coin
					refresh={!!refresh}
					id={id || coin.coin || coin.draft}
					width={frontWidth}
					image={coin.face}
					upperText={coin.name}
					lowerText={round((coin.value || coin.price), 2) + 'CƘr - \uf0c0 ' + (coin.circulation || 1)}
					backgroundColor={coin.color}
					textColor={coin.text_color}
					pattern={coin.pattern}
					patternColor={coin.pattern_color}
					animation={coin.animation}
					displayCoin={!!displayCoin}
				/>
			</div>
			<div className={'back-coin' + (!!nsfw ? 'nsfw-filter' : '')} style={{
				top: frontWidth * 0.1
			}}>
				{!!kitty ? (
					<div className="kitty-overlay">
						<i className="fas fa-cloud-upload-alt fa-4x" onClick={onUpdateBackImage} style={{
							opacity: 0.8,
							color: '#fff',
							cursor: 'pointer'
						}}></i>
					</div>
				) : null}
				<Coin
					refresh={!!refresh}
					id={id || coin.coin || coin.draft}
					width={frontWidth * 0.8}
					image={coin.back && coin.back.match(/^blob/) ? coin.face : coin.back}
					upperText={coin.domain && coin.domain.split('.').length && coin.domain.split('.')[0] || coin.name}
					lowerText={round((coin.value || coin.price), 2) + 'CƘr - ' + (coin.sequence || 1) + '/' + (coin.count || 1)}
					backgroundColor={coin.color}
					textColor={coin.text_color}
					pattern={coin.pattern}
					patternColor={coin.pattern_color}
					animation={coin.animation}
					displayCoin={!!displayCoin}
				/>
			</div>
		{(!!coin.nsfw || !!coin.flagged) && (
			!!nsfw ? (
				<button onClick={this.toggleNSFW.bind(this)} className="btn btn-outline-secondary btn-sm nsfw-show-btn">Show {coin.nsfw ? 'NSFW' : 'Flagged'}</button>
			) : (
				<button onClick={this.toggleNSFW.bind(this)} className="btn btn-outline-secondary btn-sm nsfw-show-btn">Hide {coin.nsfw ? 'NSFW' : 'Flagged'}</button>
			)
		)}
		</div>;
	}
}

export default CoinFrontBack;

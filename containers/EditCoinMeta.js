import React, { Component } from 'react';
import _ from 'underscore';
import {objectifyForm} from '../js/helpers';
import {setMeta} from '../js/grab';
import '../css/editCoinMeta';

class EditCoinMeta extends Component {
	updateCoinType(event) {
		event.preventDefault();
		var _this = this,
			$form = $(event.target),
			coin = _this.props.coin,
			data = objectifyForm($form.serializeArray()),
			coinId = _this.props.updateBatch ? '' : coin.coin;

		if (_this.props.updateBatch) {
			data.batch = coin.batch;
		}
		setMeta(coinId, data, function (error, meta) {
			if (error) {
				return $(document.body).trigger('messenger:show', ['error', error]);
			}
			coin.meta = meta;
			_this.setState({
				coin: coin
			});

			return $(document.body).trigger('messenger:show', ['message', 'Coin details saved!']);
		});
	}
	render() {
		const { coin } = this.props;
		var coinMeta = coin && coin.meta && coin.meta.type ? coin.meta : _.extend(coin.meta, {type: 'collectible'});

		if ((coin && !coin.coin) || !coinMeta) {
			return;
		}

		return (
			<div className="editcoinmeta-container col-12">
				{coinMeta && coinMeta.type !== 'cryptokitty' && _.reject(coinMeta, function (meta) {
					return !meta;
				}).length ? (
					<div className="col-12">
						<p id="coinprofile-cointype" style={{cursor: 'pointer'}} onClick={() =>
							$('#coinprofile-cointype-contents-' + coin.coin).collapse('toggle')
							}>
							<strong>Edit Coin Details</strong>
						&nbsp;
							<i className="fas fa-edit"></i>
						</p>
					</div>
				) : null}
				<div className="col-12 collapse" id={"coinprofile-cointype-contents-" + coin.coin}>
					<form onSubmit={this.updateCoinType.bind(this)}>
						<input type="hidden" name="type" value={coinMeta.type}/>
						<div className="row no-gutters">
							<div className="col">
							{coinMeta.type === 'collectible' || coinMeta.type === 'artist' ?
								<div className="form-group row no-gutters">
									<label htmlFor="inputDescription" className="col-sm-3 col-form-label">Description</label>
									<div className="col-sm-9">
										<input type="text" className="form-control" id="inputDescription" name="description" placeholder="Describe your Coin"
											defaultValue={coinMeta.description}/>
									</div>
								</div>
								: null}
							{coinMeta.type === 'collectible' ?
								<div className="form-group row no-gutters">
									<label htmlFor="inputLink" className="col-sm-3 col-form-label">Link</label>
									<div className="col-sm-9">
										<input type="url" className="form-control" id="inputLink" name="link" placeholder="Add a clickable link (https://..)"
											defaultValue={coinMeta.link}/>
									</div>
								</div>
								: null}
							{coinMeta.type === 'redeemable' ?
								<div className="form-group row no-gutters">
									<label htmlFor="inputOffer" className="col-sm-3 col-form-label">Offer</label>
									<div className="col-sm-9">
										<input type="text" className="form-control" id="inputOffer" name="offer" placeholder="Describe your offer"
											defaultValue={coinMeta.offer}/>
									</div>
								</div>
								: null}
							{coinMeta.type === 'redeemable' ?
								<div className="form-group row no-gutters">
									<label htmlFor="inputRedeem" className="col-sm-3 col-form-label">Redeem Link</label>
									<div className="col-sm-9">
										<input type="url" className="form-control" id="inputRedeem" name="redeem" placeholder="Link to redeem offer"
											defaultValue={coinMeta.redeem}/>
									</div>
								</div>
								: null}
							{coinMeta.type === 'artist' ?
								<div>
									<div className="form-group row no-gutters">
										<label htmlFor="inputVideo" className="col-sm-3 col-form-label">Video</label>
										<div className="col-sm-9">
											<input type="url" className="form-control" id="inputVideo" name="video" placeholder="Youtube or Vimeo link"
												defaultValue={coinMeta.video}/>
										</div>
									</div>

									<div className="form-group row no-gutters">
										<label htmlFor="inputPhoto" className="col-sm-3 col-form-label">Photo</label>
										<div className="col-sm-9">
											<input type="url" className="form-control" id="inputPhoto" name="photo" placeholder="Link to Photo"
												defaultValue={coinMeta.photo}/>
										</div>
									</div>
									<div className="form-group row no-gutters">
										<label htmlFor="inputLocation" className="col-sm-3 col-form-label">Location</label>
										<div className="col-sm-9">
											<input type="text" className="form-control" id="inputLocation" name="location" placeholder="Enter a location"
												defaultValue={coinMeta.location}/>
										</div>
									</div>
									<div className="form-group row no-gutters">
										<label htmlFor="inputArtistName" className="col-sm-3 col-form-label">Artist</label>
										<div className="col-sm-9">
											<input type="text" className="form-control" id="inputArtistName" name="artist" placeholder="Enter Artist Name"
												defaultValue={coinMeta.artist}/>
										</div>
									</div>
									<div className="form-group row no-gutters">
										<label htmlFor="inputYear" className="col-sm-3 col-form-label">Year</label>
										<div className="col-sm-9">
											<input type="text" className="form-control" id="inputYear" name="year" placeholder="Enter a year"
												defaultValue={coinMeta.year}/>
										</div>
									</div>
								</div>
								: null}
								<button type="submit" className="btn btn-primary btn-sm pull-right">Update</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		)
	}
}

export default EditCoinMeta;
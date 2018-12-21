import React, { Component } from 'react';
import { InfiniteScroll } from './InfiniteScroll';
import Coins from './Coins';
import { NoSearchResults } from './NoSearchResults';

import {
	getCryptoKitties,
	getCattributes,
	getCryptoKittyByID,
	refreshOnceMetaMaskAvailable
} from '../js/cryptokitties';

import { checkIfMobile } from '../js/helpers';
import { isUserLoggedIn } from '../js/auth';
import CreatableSelect from 'react-select/lib/Creatable';

import '../css/myCollection';
import { CollectionTemplate } from './CollectionTemplate';

export class KittyCollection extends Component {
	state = {
		search: null,
		sort: null
	};

	async componentDidMount() {
		this.metaMaskInterval = refreshOnceMetaMaskAvailable();

		const cattributes = await getCattributes();

		this.setState({
			cattributes
		});
	}

	componentWillUnmount() {
		clearInterval(this.metaMaskInterval);
	}

	loadPage(page) {
		const { search, sort } = this.state;

		// If one option and is just numbers - looks for kitty id
		if (search && search.match(/^\d+$/)) {
			return getCryptoKittyByID(search);
		}

		const [orderBy = 'id', orderDirection = 'desc'] = sort
			? sort.split(',')
			: [];

		return getCryptoKitties(page, {
			search: search ? search.split(',').join('+') : '',
			orderBy,
			orderDirection
		});
	}

	renderResults(coins, search) {
		if (!coins) {
			return null;
		}

		if (coins.length) {
			return <Coins coins={coins} />;
		}

		if (search && search.length) {
			<NoSearchResults search={search} />;
		}

		return <CreateYourFirstKitty />;
	}

	render() {
		const { search, sort, cattributes } = this.state;
		const isLoggedIn = isUserLoggedIn();

		return (
			<CollectionTemplate
				backButton={true}
				filter={
					<KittyFilter
						cattributes={cattributes}
						onSearch={selectedOptions =>
							this.setState({
								search: selectedOptions
									? selectedOptions
											.map(o => o.value)
											.join(',')
									: ''
							})
						}
						onSort={sort => this.setState({ sort })}
					/>
				}
				title={
					<span>
						Coinify your Kitties{' '}
						{!isLoggedIn && (
							<a
								className="btn btn-primary btn-sm"
								data-target=".signup-modal"
								data-toggle="modal"
							>
								Sign up
							</a>
						)}
					</span>
				}
			>
				<InfiniteScroll
					key={JSON.stringify({ sort, search })}
					load={page => this.loadPage(page)}
					itemsPerPage={20}
					render={coins => this.renderResults(coins, search)}
				/>
			</CollectionTemplate>
		);
	}
}

class KittyFilter extends Component {
	state = {
		showSearch: true,
		showSort: false
	};

	onSort(select) {
		const { value } = select.options[select.selectedIndex];

		this.props.onSort(value);
	}

	toggleSearch() {
		this.setState({ showSearch: !this.state.showSearch, showSort: false });
	}

	toggleSort() {
		this.setState({ showSort: !this.state.showSort });
	}

	render() {
		const { isSearching, cattributes, onSearch } = this.props;

		const { showSearch, showSort } = this.state;

		const isMobile = checkIfMobile();

		return (
			<div className="form-row justify-content-end">
				<i
					className={
						'fas fa-search' + (showSearch ? ' selected' : '')
					}
				/>
				{!!showSearch && (
					<div className="form-group col">
						{cattributes && (
							<CreatableSelect
								isMulti
								isClearable
								className="basic-single"
								classNamePrefix="select"
								name="cattributes"
								isLoading={isSearching}
								isSearchable={true}
								options={[
									{ value: '', label: 'View all' }
								].concat(
									cattributes.map(({ description }) => ({
										label: description,
										value: description
									}))
								)}
								placeholder="Search"
								onChange={selectedOptions =>
									onSearch(selectedOptions)
								}
								formatCreateLabel={input => {
									return 'Search: ' + input;
								}}
							/>
						)}
					</div>
				)}

				{!!showSort && (
					<div
						className={
							'form-group ' +
							(isMobile
								? !showSearch
									? 'col-auto'
									: 'col-auto text-center'
								: 'col-auto')
						}
					>
						<select
							className="mycollection-sort form-control form-control-sm"
							onChange={event => this.onSort(event.target)}
						>
							<option value="id,desc">age - high to low</option>
							<option value="id,asc">age - low to high</option>
							<option value="generation,desc">
								gen - high to low
							</option>
							<option value="generation,asc">
								gen - low to high
							</option>
							<option value="cooldown,desc">
								cooldown - high to low
							</option>
							<option value="cooldown,asc">
								cooldown - low to high
							</option>
							<option value="purr_count,desc">
								likes - high to low
							</option>
							<option value="purr_count,asc">
								likes - low to high
							</option>
						</select>
					</div>
				)}
				<div className="col-auto">
					<i
						className={
							'fas fa-sort-amount-down' +
							(showSort ? ' selected' : '')
						}
						onClick={() => this.toggleSort()}
					/>
				</div>
			</div>
		);
	}
}

function CreateYourFirstKitty() {
	return (
		<div className="text-center fade-in-2" style={{ marginTop: '5em' }}>
			<img
				src="https://static.socialos.net/inspinia/html/crypto/images/example-kitty-coin.jpg"
				style={{
					width: '100%',
					maxWidth: '200px',
					marginBottom: '10px'
				}}
			/>
			{typeof web3 === 'undefined' ? (
				<div>
					<h2>Immortalize your Kitty!</h2>
					<p>Install MetaMask to see your Kitties</p>
					<a
						href="https://metamask.io/"
						target="_blank"
						className="btn btn-primary btn-sm"
					>
						Install MetaMask
					</a>
				</div>
			) : web3.version.network !== '1' ? (
				<div>
					<h2>Oops! Wrong Network!</h2>
					<p>Switch MetaMask to Main Network</p>
				</div>
			) : web3 &&
			  web3.eth &&
			  web3.eth.accounts &&
			  !web3.eth.accounts.length ? (
				<div>
					<h2>Immortalize your Kitty!</h2>
					<p>Unlock MetaMask to see your Kitties</p>
				</div>
			) : (
				<div>
					<h2>Immortalize your Kitty!</h2>
					<p>Adopt a Kitty to Coinify</p>
					<a
						href="https://www.cryptokitties.co/marketplace"
						target="_blank"
						className="btn btn-primary btn-sm"
					>
						Adopt a Kitty
					</a>
				</div>
			)}
		</div>
	);
}

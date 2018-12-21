import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';

import { AsyncRoute } from './AsyncRoute';
import '../js/notification';
import {getQueryParam, checkIfMobile} from '../js/helpers';
import {history} from '../js/history';

import { MarketplacePage } from './Marketplace';
import { ExplorePage } from './ExplorePage';
import MarketplaceSort from './MarketplaceSort';
import MarketplaceBatch from './MarketplaceBatch';
import Newsfeed from './Newsfeed';
import GlobalFeed from './GlobalFeed';
import CoinGallery from './CoinGallery';
import EmbedCoin from './EmbedCoin';
import RouteHelper from './RouteHelper';

export default class App extends Component {
	componentDidMount() {
		var error = getQueryParam(location.href, 'error'),
			message = getQueryParam(location.href, 'message');

		if (error || message) {
			return $(document.body).trigger('messenger:show', ['error', message || error]);
		}
	}
	render() {
		const {loggedInUser} = this.props;
		console.log('ck - app start', performance.now());
		const isGlobal = true;

		return (
			<Router history={history}>
				<div>
						<div className="container-fluid">
							<AsyncRoute
								exact={true} path="/signup(/login)*"
								promise={() => import('./Signup')}
								render={({ match }, { default: Signup }) => (
									<Signup {...this.props}/>
								)}/>

							<Route exact={true} path="/marketplace/all" render={() => (
								<ExplorePage {...this.props} global={true}/>
							)}/>
							<Route exact={true} path="/marketplace" render={(match) => (
								<MarketplacePage {...this.props} global={isGlobal}/>
							)}/>
							<Route exact={true} path="/sort/:categoryTerm" render={({match}) => (
								<MarketplaceSort {...this.props} categoryTerm={match.params.categoryTerm}/>
							)}/>
							<Route exact={true} path="/marketplace/all/sort/:categoryTerm" render={({match}) => (
								<MarketplaceSort {...this.props} categoryTerm={match.params.categoryTerm}/>
							)}/>
							<Route exact={true} path="/marketplace/tag/:tagTerm" render={({match}) => (
								<MarketplacePage {...this.props} global={true} tagTerm={match.params.tagTerm}/>
							)}/>
							<Route exact={true} path="/marketplace/all/tag/:tagTerm" render={({match}) => (
								<ExplorePage {...this.props} global={true} tagTerm={match.params.tagTerm}/>
							)}/>
							<Route exact={true} path="/marketplace/batch/:batchNumber" render={({match}) => (
								<MarketplaceBatch timestamp={new Date().toString()} {...this.props} batchNumber={match.params.batchNumber}/>
							)}/>
							<Route exact={true} path="/marketplace/all/batch/:batchNumber" render={({match}) => (
								<MarketplaceBatch timestamp={new Date().toString()} {...this.props} batchNumber={match.params.batchNumber}/>
							)}/>
							<Route exact={true} path="/tag/:tagTerm" render={({match}) => (
								<ExplorePage {...this.props} tagTerm={match.params.tagTerm}/>
							)}/>
							<Route exact={true} path="/tag/:tagTerm/batch/:batchNumber" render={({match}) => (
								<MarketplaceBatch timestamp={new Date().toString()} {...this.props} tagTerm={match.params.tagTerm} batchNumber={match.params.batchNumber}/>
							)}/>
							<Route exact={true} path="/marketplace/all/tag/:tagTerm/batch/:batchNumber" render={({match}) => (
								<MarketplaceBatch timestamp={new Date().toString()} {...this.props} tagTerm={match.params.tagTerm} batchNumber={match.params.batchNumber}/>
							)}/>
							<Route exact={true} path="/marketplace/tag/:tagTerm/batch/:batchNumber" render={({match}) => (
								<MarketplaceBatch timestamp={new Date().toString()} {...this.props} tagTerm={match.params.tagTerm} batchNumber={match.params.batchNumber}/>
							)}/>
							<Route exact={true} path="/search/:searchTerm" render={({match}) => (
								<ExplorePage {...this.props} searchTerm={match.params.searchTerm}/>
							)}/>
							<Route exact={true} path="/marketplace/search/:searchTerm" render={({match}) => (
								<ExplorePage {...this.props} searchTerm={match.params.searchTerm}/>
							)}/>
							<Route exact={true} path="/tag/:domain/:tagTerm" render={({match}) => (
								<ExplorePage {...this.props} domain={match.params.domain} tagTerm={match.params.tagTerm}/>
							)}/>

							<AsyncRoute
								exact={true}
								path="/collection"
								promise={() => import('./CollectionOverview')}
								render={({ match }, { CollectionOverview }) => (
									<CollectionOverview global={isGlobal} />
								)} />
							<AsyncRoute
								exact={true}
								path="/collection/given"
								promise={() => import('./GivenCollection')}
								render={({ match }, { GivenCollection }) => (
									<GivenCollection {...this.props} global={isGlobal}/>
								)} />
							<AsyncRoute
								exact={true}
								path="/collection/all"
								promise={() => import('./MyCollection')}
								render={({ match }, { default: MyCollection }) => (
									<MyCollection key="all" {...this.props} global={isGlobal} />
								)} />
							<AsyncRoute
								exact={true}
								path="/collection/designs"
								promise={() => import('./DesignCollection')}
								render={({ match }, { DesignCollection }) => (
									<DesignCollection />
								)} />
							<AsyncRoute
								exact={true}
								path="/collection/kitties"
								promise={() => import('./KittyCollection')}
								render={({ match }, { KittyCollection }) => (
									<KittyCollection {...this.props} />
								)} />
							<AsyncRoute
								exact={true}
								path="/collection/tag/:tagTerm"
								promise={() => import('./MyCollection')}
								render={({ match }, { default: MyCollection }) => (
									<MyCollection key={JSON.stringify(match.params)} {...this.props} tagTerm={decodeURIComponent(match.params.tagTerm)} />
								)} />
							<AsyncRoute
								exact={true}
								path="/collection/search/:searchTerm"
								promise={() => import('./MyCollection')}
								render={({ match }, { default: MyCollection }) => (
									<MyCollection key={JSON.stringify(match.params)}{...this.props} searchTerm={decodeURIComponent(match.params.searchTerm)} />
								)} />
							<AsyncRoute
								exact={true}
								path="/collection/sort/:categoryTerm"
								promise={() => import('./MyCollection')}
								render={({ match }, { default: MyCollection }) => (
									<MyCollection key={JSON.stringify(match.params)}{...this.props} categoryTerm={decodeURIComponent(match.params.categoryTerm)} />
								)} />
							<AsyncRoute
								exact={true}
								path='/collection/batch/:batchNumber/:userId'
								promise={() => import('./BatchCollection')}
								render={({ match }, { BatchCollection }) => (
									<BatchCollection batch={match.params.batchNumber} user={match.params.userId} />
								)} />
							<AsyncRoute
								exact={true}
								path='/collection/:username/batch/:batchNumber/:userId'
								promise={() => import('./BatchCollection')}
								render={({ match }, { BatchCollection }) => (
									<BatchCollection {...this.props} batch={match.params.batchNumber} user={match.params.userId} />
								)} />


							<Route exact={true} path="/newsfeed" render={() => (
								<Newsfeed {...this.props}/>
							)}/>
							<Route exact={true} path="/globalfeed" render={() => (
								<GlobalFeed {...this.props}/>
							)}/>

							<AsyncRoute path="/coin/:coinSymbol/:sequence" promise={() => import('./CoinProfile')} render={({match}, { default: CoinProfile }) => (
								<CoinProfile {...this.props} coinSymbol={match.params.coinSymbol} sequence={match.params.sequence}/>
							)} />


							<Route exact={true} path="/coingallery/:userId" render={({match}) => (
								<CoinGallery {...this.props} userId={match.params.userId}/>
							)} />


							<Route exact={true} path="/embed/newsfeed/:grabName" render={({match}) => (
								<GlobalFeed {...this.props} grabName={match.params.grabName}/>
							)} />
							<Route exact={true} path="/embed/coin/:coinId" render={({match}) => (
								<EmbedCoin {...this.props} coinId={match.params.coinId} coinSize={300}/>
							)} />
							<Route exact={true} path="/embed/coin/:coinId/size/:coinSize" render={({match}) => (
								<EmbedCoin {...this.props} coinId={match.params.coinId} coinSize={match.params.coinSize}/>
							)} />
							<Route exact={true} path="/embed/front/coin/:coinId" render={({match}) => (
								<EmbedCoin {...this.props} view="front" coinId={match.params.coinId} coinSize={300}/>
							)} />
							<Route exact={true} path="/embed/front/coin/:coinId/size/:coinSize" render={({match}) => (
								<EmbedCoin {...this.props} view="front" coinId={match.params.coinId} coinSize={match.params.coinSize}/>
							)} />
							<Route exact={true} path="/embed/back/coin/:coinId" render={({match}) => (
								<EmbedCoin {...this.props} view="back" coinId={match.params.coinId}/>
							)} />
							<Route exact={true} path="/embed/back/coin/:coinId/size/:coinSize" render={({match}) => (
								<EmbedCoin {...this.props} view="back" coinId={match.params.coinId} coinSize={match.params.coinSize}/>
							)} />

							<Route path="*" render={() => (
								<RouteHelper {...this.props}/>
							)}/>

						</div>
				</div>
			</Router>
		);
	}
}

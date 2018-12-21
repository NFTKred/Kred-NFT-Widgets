import React from 'react';
import Coins from './Coins';
import { LoadingMessage } from './LoadingMessage';
import { getFirstName } from '../js/helpers';

export function CoinsSearchResults({ domainNoneOnSale, domainMarketplaceShop, myMarketplaceShop, marketplaceOwner, coins, filter, page, viewOnly,
    ...
    props
    })
    {
        if (coins.length === 0) {
            if (filter.search) {
                return (
                    <LoadingMessage>No results for {filter.search}</LoadingMessage>
                );
            } else {
                if (page === 1) {
                    return <LoadingMessage>No Coins found!</LoadingMessage>;
                }

            }
        }

        return <div>
		{domainNoneOnSale ? <h3>{getFirstName(marketplaceOwner)} has no {filter.search ? <strong>"{filter.search}"</strong> : ''} Coins listed for Sale. Browse the Global Marketplace: </h3> : null}
				<Coins viewOnly={viewOnly} coins={coins} domainMarketplaceShop={domainMarketplaceShop} myMarketplaceShop={myMarketplaceShop} marketplaceOwner={marketplaceOwner} {...props} />
			</div>;
    }

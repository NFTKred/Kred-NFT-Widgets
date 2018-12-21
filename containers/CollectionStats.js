import React from 'react';
import { Tooltip } from './Tooltip';

export function CollectionStats({ first, firstTitle, second, secondTitle }) {
	return (
		<div className="mycollection-total-stats">
			<p>
				<Tooltip title={firstTitle || first}>{first}</Tooltip>
				{first && second ? ' | ' : <span>&nbsp;</span>}
				<Tooltip title={secondTitle || second}>{second}</Tooltip>
			</p>
		</div>
	);
}

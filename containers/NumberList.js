import React from 'react';

function NumberList({ selectorName, coinValue, coinCount, units, onChange }) {
	return (
		<select onChange={onChange} className={'form-control ' + selectorName} defaultValue={coinValue}>
			{Array.from(
				Array(
					coinCount
						? Math.floor(coinCount)
						: coinValue && coinValue > 100
							? coinValue + 50
							: units === 'Day'
								? 7
								: 1000
				).keys()
			).map(index => (
				<option key={index} value={index + 1}>
					{index + 1}
					{units ? ' ' + units : ' CƘr'}
					{!!units && units.match(/(Day|Coin)/) && index + 1 !== 1
						? 's'
						: ''}
				</option>
			))}
		</select>
	);
}

export default NumberList;

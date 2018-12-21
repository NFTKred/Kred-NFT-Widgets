import React from 'react';

export function Spinner() {
	return (
		<p
			className="text-center"
			style={{ margin: '10vh 0', color: '#cacaca' }}
			data-testid="spinner"
		>
			<i className="fas fa-spinner fa-spin" />
		</p>
	);
}

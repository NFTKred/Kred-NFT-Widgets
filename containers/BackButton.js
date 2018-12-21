import React from 'react';
import { history } from '../js/history';

export function BackButton(props = { style: { padding: '0 10px 10px' } }) {
	return (
		<p {...props}>
			<a onClick={() => history.goBack()} title="Back">
				<i className="fas fa-angle-left" />
				&nbsp;Back
			</a>
		</p>
	);
}

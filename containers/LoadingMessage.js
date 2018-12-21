import React from 'react';

export class LoadingMessage extends React.Component {
	render({ children }) {
		return (
			<p
				style={{
					padding: '5px'
				}}
			>
				{children}
			</p>
		);
	}
}

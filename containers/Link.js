import React from 'react';
import { history } from '../js/history';

export function Link({ href, children, ...props }) {
	return (
		<a href={href} {...props} onClick={event => {
            event.preventDefault();
            history.push(href);
        }}>
			{children}
		</a>
	);
}

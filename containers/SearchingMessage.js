import React from 'react';
import { LoadingMessage } from './LoadingMessage';

export function SearchingMessage() {
	return (
		<LoadingMessage><p className="text-center" style={{margin: '10vh 0'}}><i className="fas fa-spinner fa-spin" /></p></LoadingMessage>
	);
}
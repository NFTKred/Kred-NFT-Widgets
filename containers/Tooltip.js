import React, { Component } from 'react';
import $ from 'jquery';

export class Tooltip extends Component {
	componentDidMount() {
		this.initTooltip();
	}
	
	componentDidUpdate() {
		this.initTooltip();
	}

	initTooltip() {
		$(this.root).tooltip();
	}
	
	render() {
		const { children, title, placement = 'top' } = this.props;

		return (
			<span
				data-toggle="tooltip"
				data-placement={placement}
				title={title}
				ref={root => this.root = root}
			>
				{children}
			</span>
		);
	}
}

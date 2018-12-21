import React from 'react';

const suites = {};

export class Index extends React.Component {
	componentDidMount() {
		setTimeout(() => this.setState({suites}));
	}

	render() {
		return (
			<ol>
				{Object.keys(suites).map(id => (
					<li>
						<a href={`#${id}`}>{suites[id]}</a>
					</li>
				))}
			</ol>
		);
	}
}

export function Suite({ name, children }) {
	const id = `suite-${name.split(/\s+/).join('-')}`;

	suites[id] = name;

	return (
		<fieldset
			id={id}
			style={{border: '1px solid #aaa', padding: '1em', margin: '1em'}}
		>
			<legend style={{textDecoration: 'underline'}}>{name}</legend>
			{children}
		</fieldset>
	);
}

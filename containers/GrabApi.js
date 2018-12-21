import { api } from '../js/grab';
import React from 'react';
import { errorNotification } from '../js/notification';

export class GrabApi extends React.Component {
	// TODO - remove this once Preact supports getDerivedStateFromProps
	constructor(props) {
		super();

		this.state = GrabApi.getDerivedStateFromProps(props, {});
	}

	// TODO - remove this once Preact supports getDerivedStateFromProps
	componentWillReceiveProps(newProps) {
		this.setState(GrabApi.getDerivedStateFromProps(newProps, this.state));
	}

	shouldComponentUpdate(nextProps, nextState) {
		return (
			nextState.data ||
			!!GrabApi.getDerivedStateFromProps(nextProps, this.state)
		);
	}

	static getDerivedStateFromProps(props, state) {
		const { method, path, params } = props;

		if (this.hasChanged(method, path, params, state)) {
			return {
				method,
				path,
				params,
				data: null
			};
		}
	}

	static hasChanged(method, path, params, state) {
		if (method !== state.method || path !== state.path) {
			return true;
		}

		if (params && state.params) {
			if (
				Object.keys(params).length !== Object.keys(state.params).length
			) {
				return true;
			}

			for (let key in params) {
				if (params[key] !== state.params[key]) {
					return true;
				}
			}
		} else if (params !== state.params) {
			return true;
		}

		return false;
	}

	componentDidMount() {
		var _this = this;
		_this._onCoinAction = () =>
			_this.setState({
				data: null
			});
		$(document.body).on('coinAction:done', function(event) {
			_this._onCoinAction();
			_this.loadData();
		});

		this.loadData();
	}

	componentDidUpdate() {
		this.loadData();
	}

	componentWillUnmount() {
		$(document.body).off('coinAction:done', this._onCoinAction);
	}

	loadData() {
		if (!this.state.data) {
			const { method, path, params } = this.state;

			api(method, path, params)
				.then(data => {
					if (!GrabApi.hasChanged(method, path, params, this.state)) {
						this.setState({ data });
					}
				})
				.catch(error => {
					errorNotification(error);
					console.error(error);
				});
		}
	}

	render() {
		if (!this.state.data) {
			return this.props.loading;
		}

		const renderFunction = this.props.render || this.children;

		if (renderFunction) {
			return renderFunction(this.state.data);
		}

		return null;
	}
}

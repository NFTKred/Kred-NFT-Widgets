import React from 'react';
import { Link } from 'react-router-dom';
import _ from 'underscore';
import '../css/popularSearches.css';
import { isUserLoggedIn } from '../js/auth';
import { popularTags, topTags } from '../js/grab';
import { errorNotification } from '../js/notification';

export class PopularSearches extends React.Component {
	constructor() {
		super();

		this.state = {
			top: [],
			popular: []
		};
	}

	componentDidMount() {
		const isLoggedIn = isUserLoggedIn();

		if (isLoggedIn) {
			topTags({count: 10}, (error, top) =>
					this.setState({
						top
					})
			);
		}

		popularTags({count: 10}, (error, popular) =>
				this.setState({
					popular
				})
		);
	}
	componentDidUpdate() {
		if (location.pathname === '/' || location.pathname.match(/marketplace\/all$/)) {
			$('.popular-searches').show();
		}
	}
	render() {
		const { onSelect } = this.props;
		const { top, popular } = this.state;

		const searches = _.first(_.uniq(_.map(top.concat(popular), function (search) {
			search.tag = search.tag && search.tag.replace(/^(audience|topic):/, '');
			return search;
		}), function (search) {
			return search.tag;
		}), 10);

		return (
		!!searches && (
			<div className="popular-searches" style={{display: 'none'}}>
				<strong>Popular Searches: </strong>

					{searches.map(search => (
						<a
							className="popular-search"
							href={location.pathname.split('/tag')[0] + '/tag/' + search.tag}
						>
							{search.tag}
						</a>
					))}
			</div>
		)
		);
	}
}

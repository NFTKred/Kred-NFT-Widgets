import React from 'react';
import { BackButton } from './BackButton';
import { checkIfMobile } from '../js/helpers';

export function CollectionTemplate({
	filter,
	backButton,
	title,
	actions,
	children
}) {
	const isMobile = checkIfMobile();

	return (
		<div className="mycollection-container">
			<div className="mycollection-tabs-container">
				{filter ? filter : null}

				<div className="tab-content">
					{backButton ? <BackButton /> : null}

					{title || actions ? (
						<div
							className="row no-gutters"
							style={{ padding: '10px 10px 0' }}
						>
							<div className="col-sm-6">
								<h2 className="mycollection-title">
									{title}
								</h2>
							</div>

							{actions ? (
								<div className="col-sm-6 text-right">
									{actions}
								</div>
							) : null}
						</div>
					) : null}

					{children}
				</div>
			</div>
		</div>
	);
}

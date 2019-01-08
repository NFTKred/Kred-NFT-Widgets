import { random } from 'underscore';
import { openAsyncModal } from '../../js/modal';

export function openGiveACoinModal(props) {
	return openAsyncModal(
		import(/* webpackChunkName: "GiveACoin" */ './GiveACoin').then(
			({ GiveACoin }) => GiveACoin
		),
		{
			...props,
			random1: random(1, 5),
			random2: random(6, 9),
		}
	);
}

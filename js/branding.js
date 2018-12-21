export function isGlobalMarketplace() {
	return !!(
		(window.branding && window.branding.ck_global_marketplace) ||
		location.hostname === 'localhost'
	);
}

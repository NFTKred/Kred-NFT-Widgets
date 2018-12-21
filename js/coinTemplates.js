function getCoinTemplates(userAvatar) {
	var defaultItems = [{
			name: 'Thank You',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/thankyou-icon.png',
			frontImage: 'https://imgcdn.socialos.io/web/files/coin_templates/thankyou-front.png',
			backImage: userAvatar,
			color: '#0684ec',
			textColor: '#dddddd'
		}, {
			name: 'Pay It Forward',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/payitforward-icon.png',
			frontImage: 'https://imgcdn.socialos.io/web/files/coin_templates/payitforward-front.png',
			backImage: userAvatar,
			color: '#e21a1a',
			textColor: '#ffffff'
		}, {
			name: '#SocialGood',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/socialgood-icon.png',
			frontImage: '',
			backImage: userAvatar,
			color: '',
			textColor: ''
		}, {
			name: 'We\'re Engaged',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/wereengaged-icon.png',
			frontImage: 'https://imgcdn.socialos.io/web/files/coin_templates/wereengaged-front.png',
			backImage: userAvatar,
			color: '#ffffff',
			textColor: '#dadada'
		}, {
			name: 'Our Wedding Day',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/ourweddingday-icon.png',
			frontImage: '',
			backImage: userAvatar,
			color: '#ffffff',
			textColor: '#dadada'
		}, {
			name: 'Share to Win',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/sharetowin-icon.png',
			frontImage: '',
			backImage: userAvatar,
			color: '#ffffff',
			textColor: '#dadada'
		}, {
			name: 'Loyalty Coin',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/loyaltycoin-icon.png',
			frontImage: '',
			backImage: userAvatar,
			color: '#ffffff',
			textColor: '#dadada'
		}, {
			name: 'Let\'s Connect',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/letsconnect-icon.png',
			frontImage: 'https://imgcdn.socialos.io/web/files/coin_templates/letsconnect-front.png',
			backImage: userAvatar,
			color: '#ffffff',
			textColor: '#dadada'
		}, {
			name: 'It\'s a Boy',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/itsaboy-icon.png',
			frontImage: 'https://imgcdn.socialos.io/web/files/coin_templates/itsaboy-front.png',
			backImage: userAvatar,
			color: '#00bba2',
			textColor: '#ffffff'
		}, {
			name: 'It\'s a Girl',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/itsagirl-icon.png',
			frontImage: 'https://imgcdn.socialos.io/web/files/coin_templates/itsagirl-front.png',
			backImage: userAvatar,
			color: '#d14cf7',
			textColor: '#ffffff'
		}, {
			name: '#Caturday',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/caturday-icon.png',
			frontImage: 'https://imgcdn.socialos.io/web/files/coin_templates/caturday-front.png',
			backImage: userAvatar,
			color: '#ffffff',
			textColor: '#dadada'
		}, {
			name: '#ILoveMyDog',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/ilovemydog-icon.png',
			frontImage: 'https://imgcdn.socialos.io/web/files/coin_templates/ilovemydog-front.png',
			backImage: userAvatar,
			color: '#ffffff',
			textColor: '#dadada'
		}, {
			name: 'Happy Birthday',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/happybirthday-icon.png',
			frontImage: 'https://imgcdn.socialos.io/web/files/coin_templates/happybirthday-front.png',
			backImage: userAvatar,
			color: '#ffffff',
			textColor: '#dadada'
		}, {
			name: 'VIP Discount',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/vipdiscount-icon.png',
			frontImage: '',
			backImage: userAvatar,
			color: '#000000',
			textColor: '#5f5f5f'
		}, {
			name: 'Just for Fun',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/justforfun-icon.png',
			frontImage: 'https://imgcdn.socialos.io/web/files/coin_templates/justforfun-front.png',
			backImage: userAvatar,
			color: '#000000',
			textColor: '#5f5f5f'
		}, {
			name: '#Travel #Photo',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/travelphoto-icon.png',
			frontImage: '',
			backImage: userAvatar,
			color: '#ffffff',
			textColor: '#dadada'
		}, {
			name: 'Graduation',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/graduation-icon.png',
			frontImage: '',
			backImage: userAvatar,
			color: '#000000',
			textColor: '#9b9b9b'
		}, {
			name: 'Share my #video',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/sharemyvideo-icon.png',
			frontImage: '',
			backImage: userAvatar,
			color: '#ffffff',
			textColor: '#dadada'
		}, {
			name: 'I Love You',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/iloveyou-icon.png',
			frontImage: 'https://imgcdn.socialos.io/web/files/coin_templates/iloveyou-front.png',
			backImage: userAvatar,
			color: '#ffffff',
			textColor: '#dadada'
		}, {
			name: '#QuoteOfTheDay',
			buttonIcon: 'https://imgcdn.socialos.io/web/files/coin_templates/quoteoftheday-icon.png',
			frontImage: '',
			backImage: userAvatar,
			color: '#000000',
			textColor: '#9b9b9b'
		}],
		items = [];
	switch (window.branding.name) {
		case 'app.empirecoins.kred':
			items = [{
				name: 'Build Your Empire',
				buttonIcon: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/Build your empire Thumbnail.jpg',
				frontImage: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/Build your Empire.jpg',
				backImage: userAvatar,
				color: '#8bee27',
				textColor: '#ff0000',
				type: 'full',
				tag: 'reward'
			}, {
				name: 'Empire.Kred Missioneer',
				buttonIcon: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/Empire.Kred Missioneer1 Thumbnail.jpg',
				frontImage: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/Empire.Kred Missioneer1.jpg',
				backImage: userAvatar,
				color: '#11aaca',
				textColor: '#7efeff',
				type: 'full',
				tag: 'reward'
			}, {
				name: 'Empire.Kred Missioneer',
				buttonIcon: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/Empire.Kred Missioneer2 Thumbnail.jpg',
				frontImage: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/Empire.Kred Missioneer2.jpg',
				backImage: userAvatar,
				color: '#a111ca',
				textColor: '#7efeff',
				type: 'full',
				tag: 'reward'
			}, {
				name: 'Shareholder',
				buttonIcon: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/Shareholder Thumbnail.jpg',
				frontImage: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/Shareholder.jpg',
				backImage: userAvatar,
				color: '#329ffa',
				textColor: '#ffffff',
				type: 'full',
				tag: 'reward'
			}, {
				name: 'Thanks for Sharing!',
				buttonIcon: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/Thanks for Sharing Thumbnail.jpg',
				frontImage: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/Thanks for sharing.jpg',
				backImage: userAvatar,
				color: '#ffffff',
				textColor: '#000fff',
				type: 'full',
				tag: 'reward'
			}, {
				name: 'Welcome to Empire.Kred',
				buttonIcon: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/Welcome Thumbnail.jpg',
				frontImage: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/Welcome.jpg',
				backImage: userAvatar,
				color: '#11aaca',
				textColor: '#7efeff',
				type: 'full',
				tag: 'reward'
			}, {
				name: 'A Toast To You',
				buttonIcon: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/A toast to you Thumbnail.jpg',
				frontImage: 'https://d30p8ypma69uhv.cloudfront.net/branding/cointemplate/A toast to you.jpg',
				backImage: userAvatar,
				color: '#fd6609',
				textColor: '#ffffff',
				type: 'full',
				tag: 'reward'
			}].concat(defaultItems);
			break;
		default:
			items = defaultItems;
			break;
	}
	return items;
}

export {getCoinTemplates};
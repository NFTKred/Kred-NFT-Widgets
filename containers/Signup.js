import { checkLogin, checkLoginRefresh, generateUUID } from '../js/checkLogin';
import { extend, each } from 'underscore';
import { show as showSignupModal } from './signup-modal';
import BFHStatesList from 'exports-loader?BFHStatesList!../js/vendor/bootstrap-formhelpers.js';
import 'intl-tel-input/build/js/intlTelInput';
import 'intl-tel-input/build/css/intlTelInput.css';

window.BFHStatesList = BFHStatesList;

$(document).ready(function () {
	var $signUpModal = require('./signup-modal').get(),
		email,
		verify_code,
		token,
		client_id = '5334ed7eb7725d5b8c9f03ed',
		urlVerifyCode = getParameterByName('verify_code'),
		countryCode = '',
		countryRegion = '';

	// Calling initialize functions

	if (urlVerifyCode) {
		localStorage.setItem('verify_code', urlVerifyCode);
	}

	// FIX: tabs broke in Bootstrap 4 because we were using the
	// active class for styling, and now Bootstrap adds and removes
	// the active class for its own logic and functionality
	// SO we are going to remove those classes, always
	$signUpModal.on('shown.bs.tab', event =>
		$(event.target).removeClass('active show')
	);

	$signUpModal.find("#kredphone").intlTelInput({
		utilsScript: 'https://static.socialos.net/stream/build/js/bower/intl-tel-input/utils.js',
		separateDialCode: true,
		dropdownContainer: '.signup-modal',
		initialCountry: 'auto',
		geoIpLookup: function (callback) {
			$.get('https://ipinfo.io', function () {
			}, 'jsonp').always(function (resp) {
				countryCode = (resp && resp.country) ? resp.country : '';
				countryRegion = (resp && resp.region) ? resp.region : '';
				callback(countryCode);
			});
		}
	});

	setTimeout(function () {
		if (countryCode) {
			renderStatesList(window.BFHStatesList[countryCode.toUpperCase()]);
		}
	}, 5000);

	$signUpModal.find("#kredphone").on("countrychange", function (e, countryData) {
		// do something with countryData
		if (countryData && window.BFHStatesList) {
			renderStatesList(window.BFHStatesList[countryData.iso2.toUpperCase()]);
		}
	});

	function objectifyForm(formArray) {//serialize data function
		var returnArray = {};
		for (var i = 0; i < formArray.length; i++) {
			returnArray[formArray[i]['name']] = formArray[i]['value'];
		}
		return returnArray;
	}

	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	function renderStatesList(statesList) {
		$signUpModal.find('#states1').empty();
		each(statesList, function (state) {
			$signUpModal.find('#states1').append(
				'<option value="' + state.code + '">' + state.name + '</option>'
			)
		});
	}

	var user;

	$signUpModal
		//Submit login form
		.on('submit', '.signup-modal-login-form', function (e) {
			e.preventDefault();
			var data = objectifyForm($(this).serializeArray());
			email = data.email;

			$signUpModal.find('.signup-modal-login-form button').addClass('disabled').html('<i class="fa fa-spinner fa-spin fa-fw"></i>');

			var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
			var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

			console.log('isSafari OR iOS:', isSafari || iOS);
			if (isSafari || (isSafari && iOS)) {
				return window.location = 'https://login.peoplebrowsr.com/authenticate/dotceo?redirect_uri=' + window.location.href + '&' + $.param($.extend({
					client_id: client_id,
					onlogout: encodeURI('http://' + window.location.hostname + '/account/logout?preauth=' + generateUUID())
				}, data));
			}

			if (navigator.platform.substr(0, 2) === 'iP') {
				var lte9 = /constructor/i.test(window.HTMLElement),
					idb = !!window.indexedDB;

				if ((window.webkit && window.webkit.messageHandlers) || !lte9 || idb) {
					return window.location = 'https://login.peoplebrowsr.com/authenticate/dotceo?redirect_uri=' + window.location.href + '&' + $.param($.extend({
						client_id: client_id,
						onlogout: encodeURI('http://' + window.location.hostname + '/account/logout?preauth=' + generateUUID())
					}, data));
				}
			}

			$.ajax({
				type: "GET",
				dataType: "json",
				xhrFields: {
					withCredentials: true
				},
				url: 'https://login.peoplebrowsr.com/authenticate/dotceo',
				data: $.extend({
					client_id: client_id,
					onlogout: encodeURI('http://' + window.location.hostname + '/account/logout?preauth=' + generateUUID())
				}, data)
			}).done(function (signupData) {
				console.log('LOGIN:', signupData);
				$signUpModal.find('.signup-modal-login-form .error-message').hide();

				if (signupData.error && signupData.error_description) {
					$signUpModal.find('.signup-modal-login-form button').removeClass('disabled').html('Log In');
					return $signUpModal.find('.signup-modal-login-form .error-message').html(signupData.error_description).show();
				}

				checkLogin(function (token) {
					$signUpModal.find('.signup-modal-login-form button').removeClass('disabled').html('Log In');
					console.log('token:', token);

					if (!token) {
						//If no access_token - try the redirect
						var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
						console.log('isSafari:', isSafari);
						if (isSafari) {
							return window.location = 'https://login.peoplebrowsr.com/check/dotceo?redirect_uri=' + window.location.href + '&client_id=5334ed7eb7725d5b8c9f03ed';
						}
					}

					var claim = getParameterByName('claim') || localStorage.getItem('claim') || '';
					var giveaway = getParameterByName('giveaway') || localStorage.getItem('giveaway') || '';
					var coinId = localStorage.getItem('claimCoinId');
					return window.location.href = location.pathname && location.pathname.match('signup') ? '/' : (claim ? ('/claim/coin/' + coinId + '?claim=' + claim + (claim && giveaway ? '&giveaway=1' : '')) : location.pathname);
				});
			}).error(function (errorData) {
				//console.log('errorData:', errorData);
				$signUpModal.find('.signup-modal-login-form button').removeClass('disabled').html('Log In');
				if (errorData.error && errorData.error_description) {
					return $signUpModal.find('.signup-modal-login-form .error-message').html(errorData.error_description).show();
				}
			});
		})
		//Sign in Oauth
		.on('click', '.signup-modal-oauth', function (e) {
			e.preventDefault();
			//claim.peoplebrowsr.com/authorize/dotceo/twitter?client_id=5334ed7eb7725d5b8c9f03ed&redirect_uri=http%3A%2F%2Fangelaung98.claimdemo.best%3A4012%2Fauth%2Ftwitter
			var service = $(this).attr('data-service'),
				popup;

			popup = window.open('https://login.peoplebrowsr.com/authorize/dotceo/' + service + '?client_id=5334ed7eb7725d5b8c9f03ed&redirect_uri=https://login.peoplebrowsr.com/close&onlogout=' + encodeURI('http://' + window.location.hostname + '/account/logout?preauth=' + generateUUID()), '_blank', "height=600,width=600,status=yes,toolbar=no,menubar=no,location=no");
			popup.focus();

			var check = setInterval(function () {
				if (popup.closed) {
					clearInterval(check);
					checkLogin(function (token) {
						if (!token) {
							//Error with oauth
							setTimeout(function () {
								window.retryCheck = 1;
								checkLogin(function (token) {
									if (!token) {
										return $signUpModal.find('.signup-modal-login-form .error-message').html('Oauth error. Please try again.').show();
									}

									$signUpModal.modal('hide');
									var claim = getParameterByName('claim') || localStorage.getItem('claim') || '';
									var giveaway = getParameterByName('giveaway') || localStorage.getItem('giveaway') || '';
									var coinId = localStorage.getItem('claimCoinId');
									return window.location.href = location.pathname && location.pathname.match('signup') ? '/' : (claim ? ('/claim/coin/' + coinId + '?claim=' + claim + (claim && giveaway ? '&giveaway=1' : '')) : location.pathname);
								});
							}, 500);
						}

						$signUpModal.modal('hide');
						var claim = getParameterByName('claim') || localStorage.getItem('claim') || '';
						var giveaway = getParameterByName('giveaway') || localStorage.getItem('giveaway') || '';
						var coinId = localStorage.getItem('claimCoinId');
						return window.location.href = location.pathname && location.pathname.match('signup') ? '/' : (claim ? ('/claim/coin/' + coinId + '?claim=' + claim + (claim && giveaway ? '&giveaway=1' : '')) : location.pathname);
					});
				}
			}, 500);
		})
		//Submit signup kred form
		.on('submit', '.signup-modal-newkred-form', function (e) {
			e.preventDefault();
			var data = objectifyForm($(this).serializeArray()),
				countryData = $signUpModal.find('#kredphone').intlTelInput("getSelectedCountryData"),
				isValid = $signUpModal.find('#kredphone').intlTelInput("isValidNumber"),
				params;
			$('.signup-modal-newkred-form').find('.btn-primary').addClass('disabled');
			if (data && data.state && data.state.match(/LA|CT|NY|VT|WA/)) {
				$(document.body).trigger('messenger:show', ['progress', 'Creating your account...']);
			} else {
				$(document.body).trigger('messenger:show', ['progress', 'It will take 15 seconds to activate your Wallet on the Stellar Blockchain...']);
			}

			//Test phone number
			if (isValid) {
				var phone = $signUpModal.find('#kredphone').intlTelInput("getNumber");
			} else {
				$('.signup-modal-newkred-form').find('.btn-primary').removeClass('disabled');
				$(document.body).trigger('messenger:progressStop');
				var error = $signUpModal.find('#kredphone').intlTelInput("getValidationError");

				if (error == intlTelInputUtils.validationError.INVALID_COUNTRY_CODE) {
					return $(document.body).trigger('messenger:show', ['error', 'Phone input has invalid country code']);
				} else if (error == intlTelInputUtils.validationError.TOO_SHORT) {
					return $(document.body).trigger('messenger:show', ['error', 'Phone input too short']);
				} else if (error == intlTelInputUtils.validationError.TOO_LONG) {
					return $(document.body).trigger('messenger:show', ['error', 'Phone input too long']);
				} else if (error == intlTelInputUtils.validationError.NOT_A_NUMBER) {
					return $(document.body).trigger('messenger:show', ['error', 'Phone input not a number']);
				}
				return $(document.body).trigger('messenger:show', ['error', 'Phone input is invalid. Use format +12345678901']);
			}

			//if (data && data.state && data.state.match(/LA|CN|NY|VM|WA/)) {
			//	$(document.body).trigger('messenger:show', ['warn', 'Thank you for signing up for Crypto.Kred. Your local regulations prohibit us' +
			//	' from giving or selling you CKr, so you can\'t create Coins at this time. We will email you if those regulations change.']);
			//}

			var now = new Date(),
				utc_now_timestamp = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),
					now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()),
				utc_expire_timestamp = Date.UTC(2018, 5, 15, 23, 59, 59);

			var claim = getParameterByName('claim') || localStorage.getItem('claim') || false;

			params = {
				username: data.username,
				email: data.email,
				phone: encodeURI(phone.replace(/\s|\-|\./g, '')),
				cc: countryData.iso2,
				state: data.state,
				channel: 'Coin.Kred',
				channelurl: 'app.coin.kred'
				//redirect_uri: location.origin + '/collection',
				//claim: getParameterByName('claim')
			};

			if (claim) {
				params.claim = claim;
			}

			if (utc_now_timestamp < utc_expire_timestamp) {
				params.early = 1;
			}
			//window.location.href = 'https://claim.peoplebrowsr.com/ul_register/dotceo?' + $.param(params);

			$.ajax({
				type: "POST",
				dataType: "json",
				xhrFields: {
					withCredentials: true
				},
				url: 'https://claim.peoplebrowsr.com/ul_register/dotceo',
				data: params
			}).done(function (signupData) {
				if (signupData.error && signupData.message) {
					return $(document.body).trigger('messenger:show', ['error', signupData.message]);
				}

				$.ajax({
					type: "GET",
					dataType: "json",
					xhrFields: {
						withCredentials: true
					},
					url: 'https://login.peoplebrowsr.com/authenticate/dotceo',
					data: {
						email: data.email,
						password: signupData.password,
						client_id: client_id,
						onlogout: encodeURI('http://' + window.location.hostname + '/account/logout?preauth=' + generateUUID())
					}
				}).done(function (signupData) {
					$(document.body).trigger('messenger:progressStop');
					$(document.body).trigger('messenger:show', ['message', 'Account successfully created']);
					//$signUpModal.find('a[href="#telegram"]').tab('show');
					$signUpModal.find('a[href="#completeprofile"]').tab('show');
					//return window.location.href = location.pathname && location.pathname.match('signup') ? '/' : location.pathname + (claim ? ('?claim=' + claim) : '');
				});
			});
		})
		.on('show.bs.tab', 'a[href="#completeprofile"]', function (e) {
			//Auto fill details
			checkLoginRefresh(function (token) {
				$.ajax({
					type: "GET",
					dataType: "json",
					url: 'https://api.grab.live/user/home',
					data: {
						token: window.token
					}
				}).done(function (profileData) {
					//console.log('profileData:', profileData);
					user = profileData.user;

					$signUpModal.find('.avatar-background').css({backgroundImage: "url(" + user.bio.avatar + ")"});
					//$signUpModal.find('.signup-modal-completeprofile-form .completeprofile-fullname').val(user.bio.name);
					$signUpModal.find('.signup-modal-completeprofile-form #location').val(user.bio.state);
					$signUpModal.find('.signup-modal-completeprofile-form #avatar').val(user.bio.avatar);
					$signUpModal.find('.signup-modal-completeprofile-form #bio').val(user.bio.description);
				});
			});

		})
		//Upload avatar
		.on('change', '.signup-modal-completeprofile-form .avatar-input', function (e) {
			e.preventDefault();
			var file = document.getElementById("avatar-input").files[0],
				fileExt = $(this).val().split('.').pop().toLowerCase();

			if ($.inArray(fileExt, ['gif', 'png', 'jpg', 'jpeg']) == -1) {
				return alert('Invalid file!');
			}
			$(document.body).trigger('messenger:show', ['progress', 'Uploading avatar..']);
			var reader = new FileReader();
			reader.onloadend = function () {
				checkLogin(function (token) {
					$.ajax({
						type: "POST",
						dataType: "json",
						url: 'https://api.grab.live/file/upload',
						data: {
							token: window.token,
							content: reader.result.replace('data:image/jpeg;base64,', ''),
							name: [new Date().getTime(), file.name].join('_')
						}
					}).done(function (uploadData) {
						//console.log('upload:', uploadData.url);
						$(document.body).trigger('messenger:progressStop');
						if (uploadData && !uploadData.url) {
							return $(document.body).trigger('messenger:show', ['error', 'Error uploading image.']);
						}
						$signUpModal.find('.avatar-background').css({backgroundImage: "url(" + reader.result + ")"});
						return $signUpModal.find('.avatar-url').val(uploadData.url);
					});
				});

			};

			if (file) {
				reader.readAsDataURL(file);
			}
		})
		//Save user profile
		.on('submit', '.signup-modal-completeprofile-form', function (e) {
			e.preventDefault();
			var data = objectifyForm($(this).serializeArray());
			checkLogin(function (token) {
				$.ajax({
					type: 'GET',
					url: 'https://api.grab.live/profile/api',
					data: {
						domain: 'ep.jdr.ceo',
						api: '/api/user/edit',
						'__data': JSON.stringify({
							userEntity: {
								id: user.id,
								bio: {
									name: data.name,
									description: data.bio,
									location: data.location,
									title: data.title,
									avatar: data.avatar,
									__ns: 'bio'
								},
								__ns: 'user'
							}
						}),
						'connect_sid': true,
						'token': window.token
					},
					dataType: 'json',
					crossDomain: true
				}).done(function (response) {
					var message = response.message[0],
						payload = response.payload[0].data;

					if (!!message && message.isError) {
						return $(document.body).trigger('messenger:show', ['error', message.text]);
					}
					return $signUpModal.find('a[href="#telegram"]').tab('show');
				});
			});
		})
		.on('click', '.onSkipTelegram', function (e) {
			var claim = getParameterByName('claim') || localStorage.getItem('claim') || '';
			var giveaway = getParameterByName('giveaway') || localStorage.getItem('giveaway') || '';
			var coinId = localStorage.getItem('claimCoinId');
			return window.location.href = location.pathname && location.pathname.match('signup') ? '/' : (claim ? ('/claim/coin/' + coinId + '?claim=' + claim + (claim && giveaway ? '&giveaway=1' : '')) : location.pathname);
		})
		//On show confirm code tab
		.on('show.bs.tab', 'a[href="#confirmcode"]', function (e) {
			email = localStorage.getItem('signupEmail');
			$signUpModal.find('.signup-modal-confirmcode-form .error-message').hide();
			return $signUpModal.find('.signup-modal-confirmcode-email').html(email);
		})
		//Submit confirm code
		.on('submit', '.signup-modal-confirmcode-form', function (e) {
			e.preventDefault();
			var data = objectifyForm($(this).serializeArray());

			verify_code = data.code;

			return $signUpModal.find('a[href="#setpassword"]').tab('show');
		})
		//Resend confirmation email
		.on('click', '.signup-modal-confirmcode-resend', function (e) {
			e.preventDefault();
			$.ajax({
				type: "GET",
				dataType: "json",
				xhrFields: {
					withCredentials: true
				},
				url: 'https://claim.peoplebrowsr.com/resend_verify_email/dotceo',
				data: {
					email: email,
					verify_url: [window.location.href, '#setpassword'].join('')
				}
			}).done(function (signupData) {
				//console.log('SIGNUP:', signupData);

				return;
			});
		})
		//Forgot password
		.on('show.bs.tab', 'a[href="#forgotpassword"]', function (e) {
			//console.log('fogotpassword:');

			$signUpModal.find('.signup-modal-forgotpassword-form').attr('action', 'https://claim.peoplebrowsr.com/forgot_password/dotceo');
			$signUpModal.find('.signup-modal-forgotpassword-form').find('[name="sender"]').val('contact');
			$signUpModal.find('.signup-modal-forgotpassword-form').find('[name="landing_uri"]').val(window.location.origin + '/signup#setpassword');
			$signUpModal.find('.signup-modal-forgotpassword-form').find('[name="redirect_uri"]').val(window.location.origin + '/signup#resetsent');
		})
		//Set password
		.on('submit', '.signup-modal-setpassword-form', function (e) {
			e.preventDefault();
			var data = objectifyForm($(this).serializeArray());
			$(this).find('.error-message').hide();
			//Check if passwords match
			if (data.password !== data.confirmPassword) {
				$(this).find('.error-message').show();
				return;
			}

			$.ajax({
				type: "GET",
				dataType: "json",
				xhrFields: {
					withCredentials: true
				},
				url: 'https://claim.peoplebrowsr.com/reset_password/dotceo',
				data: {
					verify_code: localStorage.getItem('verify_code') || verify_code,
					password: data.password,
					sender: 'contact'
				}
			}).done(function (setpasswordData) {
				//console.log('setpassword:', setpasswordData);
				localStorage.removeItem('verify_code');
				if (!setpasswordData.code) {
					//verify_code has already been used
					$signUpModal.find('.signup-modal-forgotpassword-form .error-message').show();
					$signUpModal.find('a[href="#forgotpassword"]').tab('show');
					return;
				}

				//Log user in
				$.ajax({
					type: "GET",
					dataType: "json",
					xhrFields: {
						withCredentials: true
					},
					url: 'https://login.peoplebrowsr.com/token/dotceo',
					data: {
						client_id: client_id,
						code: setpasswordData.code
					}
				}).done(function (res) {
					token = res.access_token;
					window.token = token;

					checkLogin(function () {
						$signUpModal.find('.signup-modal-login-form h2').html('Log in with new password');
						return $signUpModal.find('a[href="#existing"]').tab('show');
					});
				});
			})
		})
		.on('hidden.bs.modal', function () {
			$signUpModal.find('a[href="#existing"]').tab('show');
			checkLogin(function (token) {
				//return window.location.href = '/';
			});
		})
	;
});

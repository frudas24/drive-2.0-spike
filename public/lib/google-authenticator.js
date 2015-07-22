/*global jQuery, _, gapi, MM2*/

MM2.GoogleAuthenticatorService = function (config) {
	'use strict';
	var self = this,
		GoogleUserProfile = function (authToken, googleProfileResponse) {
			var self = this;
			self.getEmail = function () {
				return googleProfileResponse.email;
			};
			self.getName = function () {
				return googleProfileResponse.name;
			};
			self.getAuthToken = function () {
				return authToken;
			};
			self.getUserId = function () {
				return googleProfileResponse.id;
			};
		},
		authorize = function (options) {
			var fullOptions = _.extend({}, config, options),
					promise = jQuery.Deferred();
			gapi.auth.authorize(fullOptions, function (result) {
				if (result.access_token && !result.error) {
					promise.resolve(result.access_token);
				} else {
					promise.reject(result.error);
				}
			});
			return promise.promise();
		},
		getUserProfile = function (token) {
			return jQuery.ajax({url:'https://www.googleapis.com/oauth2/v2/userinfo',
				dataType: 'json',
				headers:{'Authorization': 'Bearer ' + token}
			});
		};
	self.refreshToken = function () {
		return authorize({immediate: true});
	};
	self.backgroundAuthenticate = function (userId) {
		var promise = jQuery.Deferred();
		authorize({'login_hint': userId, immediate: true}).then(function (token) {
			getUserProfile(token).then(function (profile) {
				if (userId && profile.id !== userId) {
					promise.reject('user-id-mismatch');
				} else {
					promise.resolve(new GoogleUserProfile(token, profile));
				}
			}, promise.reject);
		}, promise.reject);
		return promise.promise();
	};
	self.modalAuthenticate = function (userId) {
		var promise = jQuery.Deferred();
		gapi.auth.setToken(null);
		authorize({'login_hint': userId, immediate: false, authuser: -1}).then(function (token) {
			getUserProfile(token).then(function (profile) {
					promise.resolve(new GoogleUserProfile(token, profile));
				}, promise.reject);
		});
		return promise.promise();
	};
};

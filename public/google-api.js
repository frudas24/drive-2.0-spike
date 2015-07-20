/*global window, MM2, jQuery*/
MM2.GoogleAPI = function () {
	'use strict';
	var self = this;
	self.load = function () {
		var result = jQuery.Deferred(),
				googleAPITimeout;

		window.initGoogleAPI = function () {
			if (!window.gapi || !window.gapi.auth2) {
				setStatus('loading google API auth2');
				gapi.load('auth2,drive-realtime,drive-share', initGoogleAPI);
				return;
			}
			window.cancelTimeout(googleAPITimeout);
			setStatus('ready');
		};
		window.googleAPITimeout = window.setTimeout(window.scriptLoadingFailed, ENV['SCRIPT_LOADING_TIMEOUT']);

		return result.promise();
	}


};

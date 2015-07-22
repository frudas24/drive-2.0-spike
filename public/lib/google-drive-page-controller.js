/*global MM2, window, jQuery */

MM2.queryStringToMap = function (queryString) {
	'use strict';
	return queryString.substr(1).split('&').reduce(
			function (memo, component) {
				var kvp = component.split('=').map(decodeURIComponent);
				memo[kvp[0]] = kvp[1];
				return memo;
			}, {});
};
/* Coordinates the process of initial google drive authentication and file loading (via URL params),
 * Handles Google Drive UI parameters so pages can be integrated easily with the drive UI, and
 * also changes the URL to a local file path prefix to avoid re-creating files on page reloading, and
 * to avoid breaking the back-forward buttons.
 *
 * It doesn't actually do anything with the file, but delegates the actual handling of the file to a promise resolver
 */
MM2.GoogleDrivePageController = function (defaultTitle, filePathPrefix, authenticator, googleDriveService, googleAppId) {
	'use strict';
	var self = this,
		queryStringParams = MM2.queryStringToMap(window.location.search),
		driveState = (queryStringParams.state && JSON.parse(queryStringParams.state)) || {},
		fileIdFromUrl = function () {
			var r = new RegExp('^' + filePathPrefix.replace(/\//g, '\\/') + '(.*)'),
					match = window.location.pathname.match(r);
			return match && match[1];
		};

	/*
	 * Returns a promise that will:
	 *
	 * Resolve with: (drive file ID, file name, user profile)
	 *
	 * Rejects with:
	 * - not-authenticated if not possible to do background auth, so modal auth needs to be attempted
	 * - invalid-request if neither the file path nor the query string contain a file ID to load
	 * - not-found if the user is authorised but the file is not on drive (wrong ID)
	 * - not-authorised if the file exists but the user does not have the rights to view it and should ask the owner
	 * - network-error if drive cannot be reached
	 */
	self.initPage = function (useModalAuthentication) {
		var promise = jQuery.Deferred(),
				openFile = function (fileId, userProfile) {
					promise.notify('loading metadata for file' + fileId);
					googleDriveService.getMetaData(fileId).then(function (fileMeta) {
						/** TODO: check mime type, recognise if importing required **/
						if (fileMeta.mimeType !== 'application/vnd.google-apps.drive-sdk.' + googleAppId) {
							promise.reject('invalid-file-type', fileMeta.mimeType);
						} else {
							window.history.replaceState({}, fileMeta.title, filePathPrefix + fileId);
							promise.resolve(fileId, fileMeta.title, userProfile);
						}
					}, promise.reject);
				},
				postLogin = function (userProfile) {
					if (driveState.action === 'create') {
						promise.notify('creating a file in folder ' + driveState.folderId + ' for user ' + userProfile.getEmail());
						googleDriveService.createShortcut(defaultTitle, driveState.folderId).then(function (id) {
							promise.notify('File shortcut created: ' + id + ' for user ' + userProfile.getEmail());
							window.history.replaceState({}, defaultTitle, filePathPrefix + id);
							promise.resolve(id, defaultTitle, userProfile);
						}, promise.reject);
					} else if (driveState.action === 'open') {
						if (driveState.ids && driveState.ids[0]) {
							openFile(driveState.ids[0], userProfile);
						} else {
							promise.reject('invalid-request');
						}
					} else if (fileIdFromUrl()) {
						openFile(fileIdFromUrl(), userProfile);
					} else {
						promise.reject('invalid-request');
					}
				},
				authFunction = useModalAuthentication ? 'modalAuthenticate' : 'backgroundAuthenticate';
		if ((driveState && driveState.userId) || fileIdFromUrl()) {
			promise.notify('signing in ' + (useModalAuthentication ? ' with modal' : ' in background'));
			authenticator[authFunction](driveState && driveState.userId).then(postLogin, function () {
				promise.reject('not-authenticated');
			});
		} else {
			promise.reject('invalid-request');
		}


		return promise.promise();
	};
};

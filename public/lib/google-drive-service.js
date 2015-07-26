/*global MM2, jQuery, gapi */

/*TODO - reject with more meaninful errors, especially
 * not-authenticated, not-authorised, network-error, invalid-request */

MM2.GoogleDriveService = function () {
	'use strict';
	var self = this,
			shortcutMimeType = 'application/vnd.google-apps.drive-sdk',
			baseUrl = 'https://www.googleapis.com/drive/v2/',
			currentToken = function () {
				return gapi.auth.getToken().access_token;
			};
	self.getDriveAppMetadata = function (appId) {
		return jQuery.ajax({
			type: 'GET',
			url: baseUrl + 'apps/' + appId,
			headers: {
				'Authorization': 'Bearer ' + currentToken()
			},
			dataType: 'json'
		});
	};
	self.getMetaData = function (fileId) {
		return jQuery.ajax({
			type: 'GET',
			url: baseUrl + 'files/' + fileId,
			headers: {
				'Authorization': 'Bearer ' + currentToken()
			},
			dataType: 'json'
		});
	};
	self.uploadThumbnail = function (fileId, dataUri) {
		/* TODO: make this work by reading the data URI mime type */
		var base64EncodeUrl = function (str) {
				return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
			},
			metadata = {
				thumbnail: {image: base64EncodeUrl(dataUri.substring(22)), mimeType: 'image/png'}
			};
		return jQuery.ajax({
			type: 'PATCH',
			url: baseUrl + 'files/' + fileId,
			headers: {
				'Authorization': 'Bearer ' + currentToken(),
				'Content-Type': 'application/json'
			},
			dataType: 'json',
			data: JSON.stringify(metadata)
		});
	};
	self.renameFile = function (fileId, newName) {
		var metadata = {
			'title': newName
		};
		return jQuery.ajax({
			type: 'PATCH',
			url: baseUrl + 'files/' + fileId,
			headers: {
				'Authorization': 'Bearer ' + currentToken(),
				'Content-Type': 'application/json'
			},
			dataType: 'json',
			data: JSON.stringify(metadata)
		});
	};
	self.createShortcut = function (title, folderId) {
		var promise = jQuery.Deferred(),
				metadata = {
					'title': title,
					'mimeType': shortcutMimeType,
					'parents': folderId && [{id: folderId}]
				};
		jQuery.ajax({
			type: 'POST',
			url: baseUrl + 'files',
			headers: {
				'Authorization': 'Bearer ' + currentToken(),
				'Content-Type': 'application/json'
			},
			data: JSON.stringify(metadata),
			dataType: 'json'
		}).then(function (result) {
			promise.resolve(result.id);
		}, promise.reject);
		return promise.promise();
	};
};

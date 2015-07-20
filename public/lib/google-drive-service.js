/*global MM2, jQuery */
MM2.GoogleDriveService = function () {
	'use strict';
	var self = this,
			shortcutMimeType = 'application/vnd.google-apps.drive-sdk';
	self.getMetaData = function (authToken, fileId) {
		return jQuery.ajax({
			type: 'GET',
			url: 'https://www.googleapis.com/drive/v2/files/' + fileId,
			headers: {
				'Authorization': 'Bearer ' + authToken
			},
			dataType: 'json'
		});
	};
	self.createShortcut = function (authToken, title, folderId) {
		var promise = jQuery.Deferred(),
				boundary = '--multipart-boundary--',
				delimiter = '\r\n--' + boundary + '\r\n',
				closeDelim = '\r\n--' + boundary + '--',
				metadata = {
					'title': title,
					'mimeType': shortcutMimeType,
					'parents': folderId && [{id: folderId}]
				},
				multipartRequestBody =
					delimiter +
					'Content-Type: application/json\r\n\r\n' +
					JSON.stringify(metadata) +
					closeDelim;
		jQuery.ajax({
			type: 'POST',
			url: 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart',
			headers: {
				'Authorization': 'Bearer ' + authToken,
				'Content-Type': 'multipart/related; boundary="' + boundary + '"'
			},
			data: multipartRequestBody,
			dataType: 'json'
		}).then(function (result) {
			promise.resolve(result.id);
		}, function (jqXHR, textStatus, errorThrown) {
			promise.reject(textStatus, errorThrown);
		});
		return promise.promise();
	};
};

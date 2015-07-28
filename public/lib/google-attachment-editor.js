/*global jQuery, google, _, URL, Blob*/

jQuery.fn.googleDriveAttachmentEditor = function (mapModel, authenticator) {
	'use strict';
	/*TODO: Support editing existing icon dimensions etc,
	 * pass USER_ID to be able to log in the correct user in a multi-user scenario
	 */
	return jQuery(this).each(function () {
		var element = jQuery(this),
				showAuth = function () {
					element.find('[role=auth]').show();
				},
				hideAuth = function () {
					element.find('[role=auth]').hide();
				},
				myContentType = 'application/vnd.google.drive',
				createAttachmentMetaData = function (item) {
					return _.extend(_.pick(item, 'name', 'mimeType', 'type', 'url', 'iconUrl', 'description', 'embedUrl'), {
						thumbnail: item.thumbnails && _.sortBy(item.thumbnails, 'height').pop().url
					});
				},
				launchPicker = function (authToken) {
					var deferred = jQuery.Deferred(),
						picker,
						uploadView = new google.picker.DocsUploadView(),
						listView =  new google.picker.DocsView(google.picker.ViewId.DOCS);
					listView.setMode(google.picker.DocsViewMode.LIST);
					uploadView.setIncludeFolders(true);
					picker = new google.picker.PickerBuilder()
						.enableFeature(google.picker.Feature.SIMPLE_UPLOAD_ENABLED)
						.disableFeature(google.picker.Feature.MULTISELECT_ENABLED)
						//.setAppId(googleAppId)
						.addView(listView)
						.addView(uploadView)
						.setCallback(function (choice) {
							if (choice.action === 'picked') {
								var item = choice.docs[0];
								if (item) {
									deferred.resolve(createAttachmentMetaData(item));
								} else {
									deferred.reject();
								}
								return;
							}
							if (choice.action === 'cancel') {
								deferred.reject();
							}
						})
						.setTitle('Choose an attachment')
						.setOAuthToken(authToken)
						.build();
					picker.setVisible(true);
					return deferred.promise();
				},
				blobUrl,
				ideaId,
				loadInfo = function (attachmentMetaData) {
					element.find('[data-mm-attachment-info]').each(function () {
						var field = jQuery(this),
							val = attachmentMetaData[field.data('mm-attachment-info')] || '';
						if (!val) {
							field.hide();
						} else {
							field.show();
							if (field.is('img')) {
								field.attr('src', val);
							} else if (field.is('a')) {
								field.attr('href', val);
							} else if (field.is('iframe')) {
								field.attr('src', val);
							} else if (field.is('span')) {
								field.text(val);
							}
						}
					});
				},
				selectAttachment = function (userProfile) {
					element.hide();
					var source = 'mouse';
					launchPicker(userProfile.getAuthToken()).then(function (item) {
						if (item) {
							mapModel.setAttachment(source, ideaId, {contentType: myContentType, content: item });
						} else {
							mapModel.setAttachment(source, ideaId, false);
						}
					} /*, function () {} */);
				},
				open = function (activeIdeaId, attachment) {
					element.show();
					hideAuth();
					unsupported.hide();
					var contentType = attachment && attachment.contentType,
					attachmentMetaData = attachment && attachment.content;
					ideaId = activeIdeaId;
					if (attachment) {
						if (contentType !== myContentType) {
							unsupported.show();
							blobUrl = URL.createObjectURL(new Blob([attachment.content], {type : attachment.contentType}));
							attachmentMetaData = {embedUrl: blobUrl, url: blobUrl, type: 'HTML Document' };
						}
						loadInfo(attachmentMetaData);
					} else {
						authenticator.backgroundAuthenticate().then(selectAttachment, showAuth);
					}
				},
				iframe = element.find('iframe'),
				unsupported = element.find('[role=unsupported-format]');
		element.find('[role=approve]').on('click', function () {
			authenticator.modalAuthenticate().then(selectAttachment/*, failAuth*/);
		});
		element.find('[role=change]').on('click', function () {
			authenticator.backgroundAuthenticate().then(selectAttachment, showAuth);
		});
		mapModel.addEventListener('attachmentOpened', open);
		element.find('[role=close]').on('click', function () {
			if (blobUrl) {
				URL.revokeObjectURL(blobUrl);
			}
			iframe.attr('src', '').hide();
			element.hide();
		});
	});
};


/*global jQuery, google, _*/

jQuery.fn.googlePhotosIconEditor = function (mapModel, authenticator) {
	'use strict';
	/*TODO: Support editing existing icon dimensions etc,
	 * pass USER_ID to be able to log in the correct user in a multi-user scenario
	 */
	return jQuery(this).each(function () {
		var element = jQuery(this),
				showAuth = function () {
					element.show().find('[role=auth]').show();
				},
				launchPicker = function (authToken) {
					var deferred = jQuery.Deferred(),
						picker;
					picker = new google.picker.PickerBuilder()
						.enableFeature(google.picker.Feature.SIMPLE_UPLOAD_ENABLED)
						.disableFeature(google.picker.Feature.MULTISELECT_ENABLED)
						.addView(google.picker.ViewId.PHOTOS)
						.addView(google.picker.ViewId.PHOTO_UPLOAD)
						.setSelectableMimeTypes('application/vnd.google-apps.photo,image/png,image/jpg,image/gif,image/jpeg')
						//.setOrigin(config.pickerOrigin || window.location.protocol + '//' + window.location.host)
						.setCallback(function (choice) {
							if (choice.action === 'picked') {
								var item = choice.docs[0],
										url = item.thumbnails && _.sortBy(item.thumbnails, 'height').pop().url;
								if (url) {
									deferred.resolve(url);
								} else {
									deferred.reject();
								}
								return;
							}
							if (choice.action === 'cancel') {
								deferred.reject();
							}
						})
						.setTitle('Choose an image')
						.setOAuthToken(authToken)
						.build();
					picker.setVisible(true);
					return deferred.promise();
				},
				selectImage = function (userProfile) {
					element.hide();
					launchPicker(userProfile.getAuthToken()).then(function (url) {
						if (url) {
							mapModel.setIcon('icon-editor', url, 300, 300, 'left' /* result.width, result.height, result.position */);
						} else {
							mapModel.setIcon(false);
						}
					} /*, function () {} */);
				};
		element.find('[role=approve]').on('click', function () {
			authenticator.modalAuthenticate().then(selectImage/*, failAuth*/);
		});
		mapModel.addEventListener('nodeIconEditRequested', function () {
		/*	var icon = mapModel.getIcon();*/
			authenticator.backgroundAuthenticate().then(selectImage, showAuth);
		});
	});

};

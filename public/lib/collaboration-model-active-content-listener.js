/*global MM2, observable, MAPJS */
/* Translates between generic collaboration events into a MAPJS.Content aggregate,
 * providing the ActiveContentListener interface that MM components expect.
 */
MM2.CollaborationModelActiveContentListener = function (mm2CollaborationModel) {
	'use strict';
	var self = observable(this),
			activeContent,
			localSessionId,
			onChanged = function (method, attrs, session) {
				self.dispatchEvent('mm-active-content-changed', activeContent, false, method, attrs);
				if (session === localSessionId) {
					mm2CollaborationModel.triggerLocalContentEvent({cmd: method, args: attrs});
				}
			};
	mm2CollaborationModel.addEventListener('remoteContentEvent', function (contentEvent, sessionId) {
		activeContent.execCommand(contentEvent.cmd, contentEvent.args, sessionId);
	});
	mm2CollaborationModel.addEventListener('sessionInitialized', function (sessionId, initialContent, initialEvents) {
		if (activeContent) {
			activeContent.removeEventListener('changed', onChanged);
		}
		localSessionId = localSessionId;
		activeContent = MAPJS.content(JSON.parse(initialContent), localSessionId);
		initialEvents.forEach(function (contentEvent) {
			activeContent.execCommand(contentEvent.cmd, contentEvent.args, 'loading');
		});
		self.dispatchEvent('mm-active-content-changed', activeContent, true);
		activeContent.addEventListener('changed', onChanged);
	});
	self.getActiveContent = function () {
		return activeContent;
	};
	self.addListener = function (onActiveContentChanged) {
		if (activeContent) {
			onActiveContentChanged(activeContent, false);
		}
		self.addEventListener('mm-active-content-changed', onActiveContentChanged);
	};
};


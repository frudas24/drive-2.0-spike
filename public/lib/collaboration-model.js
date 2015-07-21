/*global MM2, observable */
/* Simple event-queue collaboration model.
 *
 * It makes no assumptions about the nature or content of the events, but talks in the model of:
 *
 *  - local vs remote events
 *  - initial content provided with session initialization
 *  - collaborator positions
 */
MM2.CollaborationModel = function (defaultInitialContent) {
	'use strict';
	var self = observable(this);
	self.initializeSession = function (localSessionId, initialContent, initialEvents) {
		self.dispatchEvent('sessionInitialized', localSessionId, initialContent, initialEvents);
	};
	self.triggerRemoteContentEvent = function (contentEvent, sessionId) {
		self.dispatchEvent('remoteContentEvent', contentEvent, sessionId);
	};
	self.triggerLocalContentEvent = function (contentEvent) {
		self.dispatchEvent('localContentEvent', contentEvent);
	};
	self.getDefaultInitialContent = function () {
		return defaultInitialContent;
	};
};


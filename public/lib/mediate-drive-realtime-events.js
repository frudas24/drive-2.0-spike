/*global MM2, gapi, window */

MM2.mediateDriveRealtimeEvents = function (driveFileId, mm2CollaborationModel, errorCallback, logger) {
	'use strict';
	var log = function (text) {
				if (logger) {
					logger(text);
				}
			},
			initializeModel = function (model) {
				log('initialising model');
				model.getRoot().set('events', model.createList());
				model.getRoot().set('focusNodes', model.createMap());
				model.getRoot().set('initialContent', JSON.stringify(mm2CollaborationModel.getDefaultInitialContent()));
			},
			onFileLoaded = function (realtimeDoc) {
				log('realtime doc loaded');
				var me = realtimeDoc.getCollaborators().filter(function (c) {
					return c.isMe;
				});
				if (me && me.length > 0 && me[0]) {
					onSessionIdRecognised(realtimeDoc, me[0].sessionId);
				}
				attachDocListeners(realtimeDoc);
				window.addEventListener('beforeunload', function () {
					try {
						if (!realtimeDoc.isClosed) {
							realtimeDoc.close();
						}
					} catch (e) {
						log('optimistic doc closing failed', e);
						// ignore error
					}
				});
			},
			onRealtimeError = function (error) {
				if (error.type == gapi.drive.realtime.ErrorType.TOKEN_REFRESH_REQUIRED) {
					errorCallback('token-refresh-required');
				} else if (error.type == window.gapi.drive.realtime.ErrorType.CLIENT_ERROR) {
					errorCallback('An Error happened: ' + error.message);
				} else if (error.type == window.gapi.drive.realtime.ErrorType.NOT_FOUND) {
					errorCallback('The file was not found. It does not exist or you do not have read access to the file.');
				} else if (error.type == window.gapi.drive.realtime.ErrorType.FORBIDDEN) {
					errorCallback('You do not have access to this file. Try having the owner share it with you from Google Drive.');
				} else {
					errorCallback('A network error occured during loading.');
				}
			},
			onCollaboratorLeft = function (collaboratorEvent) {
				log('collaborator left', collaboratorEvent.collaborator);
			},
			onCollaboratorJoined = function (collaboratorEvent) {
				log('collaborator joined', collaboratorEvent.collaborator);
				if (collaboratorEvent.collaborator.isMe) {
					onSessionIdRecognised(collaboratorEvent.target, collaboratorEvent.collaborator.sessionId);
				}
			},
			onAttributeChanged = function (attributeEvent) {
				log('attribute changed', attributeEvent);
			},
			onContentEventAdded = function (valuesAddedEvent) {
				if (!valuesAddedEvent.isLocal) {
					valuesAddedEvent.values.forEach(function (contentEvent) {
						mm2CollaborationModel.triggerRemoteContentEvent(contentEvent, valuesAddedEvent.sessionId);
					});
				}
			},
			onFocusNodeChanged = function (focusNodeEvent) {
				log('focus node event', focusNodeEvent);
			},
			attachDocListeners = function (realtimeDoc) {
				realtimeDoc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, onCollaboratorLeft);
				realtimeDoc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, onCollaboratorJoined);
				realtimeDoc.addEventListener(gapi.drive.realtime.EventType.ATTRIBUTE_CHANGED, onAttributeChanged);
				realtimeDoc.getModel().getRoot().get('events').addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, onContentEventAdded);
				realtimeDoc.getModel().getRoot().get('focusNodes').addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, onFocusNodeChanged);
			},
			onSessionIdRecognised = function (realtimeDoc, sessionId) {
				var initialContent = realtimeDoc.getModel().getRoot().get('initialContent'),
				initialEvents = realtimeDoc.getModel().getRoot().get('events').asArray();
				mm2CollaborationModel.initializeSession(sessionId, initialContent, initialEvents);
				mm2CollaborationModel.addEventListener('localContentEvent', function (evt) {
					realtimeDoc.getModel().getRoot().get('events').push(evt);
				});
			};
	gapi.drive.realtime.load(driveFileId, onFileLoaded, initializeModel, onRealtimeError);

};

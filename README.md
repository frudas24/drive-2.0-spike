MindMup 2.0 Drive Spike
------------------------

Questions to explore:

* ~~can a user logged in to multiple accounts work seamlessly?~~ 
  * ~~which auth library do we use from now on?~~
    * ~~Seems to be [a new API for auth](https://developers.google.com/identity/sign-in/web/reference#gapiauth2initwzxhzdk19paramswzxhzdk20)~~ 
      * ~~doesn't have immediate/non immediate -- how do we deal with that?~~
    * ~~[gapi.auth.signin](https://developers.google.com/identity/sign-in/web/sign-in) claims to support multiple accounts and a selector~~
  * ~~switch between accounts~~ almost: multiple users have to be logged in!
  * ~~show currently selected account~~
* ~~can we detect when the wrong user is logged in if a file is created/opened via drive?~~
  * ~~state seems to contain the user id~~
* ~~can we handle API load errors gracefully?~~
  * ~~eg timeout and show a sensible message~~
* can we enable people to self-service major support topics?
  * ~~can we log in the correct user when file is opened from drive?~~
  * ~~can we detect third-party extensions blocking access to drive and offer some more meaningful error messages?~~
    * ~~disconnect~~
      * ~~seems to block google scripts, caught correctly by 'Sadly, Google Script loading failed'~~
    * ~~ABP~~
      * didn't block anything
  * can we show a total capacity warning when close to 10 MB?
    * [model.bytesUsed](https://developers.google.com/google-apps/realtime/reference/gapi.drive.realtime.Model) shows how much it's taking
    * can we compress somehow?
  * can we show a warning on network latency
    * document.saveDelay is the timer to watch?
  * can we show a warning when read-only?
      * https://developers.google.com/google-apps/realtime/collaborators - read-only mode
  * can we store images on drive to avoid message size problems and remove capacity problems?
      * maybe use thumbmnails from the hangouts spike?
      * how does this work with exporters? can we grab them locally via CORS?
  * can we forward people to a 'request access' page when they don't have access?
* can we seamlessly migrate from physical map files to shortcuts for auto-saving?
  * what happens with drive-stored resources?
    * images
    * attachments
  * make sure exporting to local disk works by downloading images; make sure pdf/image exporters get resources 
* can we replicate typical Docs API workflow?
  * ~~loading/creating files from the Drive UI - to avoid access privilege issues~~
    * ~~create in the right folder~~
  * enable moving to a folder from within the app
  * ~~keep the folder/s when saving~~
  * ~~inherit sharing properties when created in a folder~~
  * sharing from within the app
  * can we detect remote file renames?
  * ~~can we use a single page instead of redirects from /gd, and use pushState to replace history when a file is created etc?~~
  * ~~rename file from the app (don't force the name to be the same as central node)~~
    * ~~ensure name is preserved when saving~~
* can we work in a meaningful way with completely public/read maps
  * ideally not ask clients to even log in
* can we offer more meaningful drive integration
  * attachments are files on drive?
  * images are photos from google drive photos?
  * keep required auth to a minimum
* can we offer admins more control over what is used if app is installed in a domain
  * disable/enable gold services globally
  * log on to gold for the entire domain
* what is the absolute minimum scope for drive api authorisation that we need to use for GAM?
  * can we progressively build up with messages for individual usage patterns if not GAM?
    * eg not ask for photo access unless users try to embed photos
* can we automate some kind of integration tests to protect against API changes?



discovery notes
---------------

## API

* there is a new drive-share API. What does it do?

## Authenticating

* client.js superseeded by platform.js - seems to do the same things, re loading APIs. What is the key difference?
    * almost 80K more, compared to bare client
* ~~apparently auth was superseeded by auth2~~
  * not good enough for our use, intended for apps that have a mandatory button to sign people in. it does not support immediate/non-immediate access and does not allow us to set a login_hint. completely broken on safari if we try to do it without clicking on a button. However, it seems that the underlying implementation is done using auth, so auth now has some interesting arguments we can use
  * login_hint: ID of the user we prefer to authorise, in case of multiple logged in. will force people to spin in the dialog until the right one is chosen
  * authuser: -1 forces the user choice (switch user effectively) in case of multiple users logged in
    * if several accounts are logged in at the moment, this shows a dialog to select. If a single is logged on, no dialog is shown even after log-out
  * [a comment on SO](http://stackoverflow.com/questions/22086301/gapi-auth-signout-not-working-im-lost) suggests logout does not work from localhost
* when drive.file access is requested by the app, then the OAUTH2 dialog still shows a permissions page asking for offline access??? if the drive.file is not asked by the app, then a much more sensible error message shows - can we work on this only?
  * ['generally we do not recommend drive-initiated authorization'](https://developers.google.com/drive/web/auth/drive-initiated-auth)
* how to we refresh tokens using auth2?

## creating files on drive for realtime access only

* Mime type should be application/vnd.google-apps.drive-sdk, no content uploaded
* User ID and folder ID given by Drive. But what should we do if the user does not match the selected one? Can we offer people a sensible error message

## Testing options

* Drive.realtime setServerAddress suggests it's possible to switch between production, sandbox etc environments. See lines 214-228 of [realtime-utils](https://github.com/googledrive/realtime-utils/blob/master/realtime-client-utils.js) on github
* keep a minimal skeleton troubleshooter for API access testing? 


## Support options
* window.gapi.drive.realtime.debug() launches a drive realtime debugger
* [Drive realtime release notes page](https://developers.google.com/google-apps/realtime/release-notes) has details on API updates


MindMup 2.0 Drive Spike
------------------------

Questions to explore:

* can a user logged in to multiple accounts work seamlessly? 
  * which auth library do we use from now on?
    * Seems to be [a new API for auth](https://developers.google.com/identity/sign-in/web/reference#gapiauth2initwzxhzdk19paramswzxhzdk20) 
      * doesn't have immediate/non immediate -- how do we deal with that?
    * [gapi.auth.signin](https://developers.google.com/identity/sign-in/web/sign-in) claims to support multiple accounts and a selector
  * switch between accounts
  * right file loaded via drive web site
  * show currently selected account
* can we handle API load errors gracefully? 
  * eg timeout and show a sensible message
* can we detect third-party extensions blocking access to drive and offer some more meaningful error messages?
  * disconnect
  * ABP
* can we offer a better experience using auto-saved drive realtime apps?
  * images stored on drive to avoid message size problems and remove capacity problems?
    * maybe use thumbmnails from the hangouts spike?
    * how does this work with exporters? can we grab them locally via CORS?
  * total capacity warning when close to 10 MB?
* can we seamlessly migrate from physical map files to shortcuts for auto-saving?
  * what happens with drive-stored resources?
    * images
    * attachments
* can we replicate typical Docs API workflow?
  * loading/creating files from the Drive UI - to avoid access privilege issues
    * create in the right folder
  * enable moving to a folder from within the app
  * keep the folder/s when saving
  * inherit sharing properties when created in a folder
  * sharing from within the app
* can we work in a meaningful way with completely public/read maps
  * ideally not ask clients to even log in
* can we offer more meaningful drive integration
  * attachments are files on drive
  * images are photos from google drive photos
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
* apparently auth was superseeded by auth2
  * seems to require scopes to be comma separated
  * no immediate/non-immediate option in the api docs
  * [a comment on SO](http://stackoverflow.com/questions/22086301/gapi-auth-signout-not-working-im-lost) suggests logout does not work from localhost
* client.js superseeded by platform.js?

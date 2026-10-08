# minigames

## App session

The client-side session is stored only under the localStorage key
`minigames:viktoria12007:app-session`. It contains the display name, email,
authentication timestamp, and an optional avatar URL; it never contains a password or Firebase token.

Copy `firebase.config.template` to an ignored `.env.local` and fill it with the Firebase web-app configuration.

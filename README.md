# About
This project is the backend of the Nightlight application, a GPS tracking app for friends and family.

## This project was built with:
- Remix.run
- Typescript
- React
- Postgres 

## and uses these external APIs:  
- Gmail
- MailTrap
- MapBox
- Strava

## Note:  
This public repo is for code reviews and examples of code.  
The actual in-flight code is stored in a private repo and gets moved to this repo
if significant changes occur.


## Running locally:
### To get this to run you will need to add a '.env' file and supply your own values:

APP_URL="http://localhost:3000"

DATABASE_URL=YOUR_VALUE

GMAIL_PASS=YOUR_VALUE
GMAIL_USER=YOUR_VALUE

MAIL_TRAP_USER=YOUR_VALUE
MAIL_TRAP_PASSWORD=YOUR_VALUE

MAPBOX_API=YOUR_VALUE

STRAVA_CLIENT_ID=YOUR_VALUE
STRAVA_CLIENT_SECRET=YOUR_VALUE
STRAVA_REFRESH_TOKEN=YOUR_VALUE

TOKEN_SECRET=YOUR_VALUE


### From your terminal:
npm run dev
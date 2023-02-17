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
### To get this to run you will need to add a '.env' file and supply your own values here:

APP_URL="http://localhost:3000"

DATABASE_URL=<insert your value here>

GMAIL_PASS=<insert your value here>
GMAIL_USER=<insert your value here>

MAIL_TRAP_USER=<insert your value here>
MAIL_TRAP_PASSWORD=<insert your value here>

MAPBOX_API=<insert your value here>

STRAVA_CLIENT_ID=<insert your value here>
STRAVA_CLIENT_SECRET=<insert your value here>
STRAVA_REFRESH_TOKEN=<insert your value here>

TOKEN_SECRET=<insert your value here>


### From your terminal:
npm run dev
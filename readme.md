# Events 2017 Web Programming Assignment

This is a web programming assignment as part of year 2 of my Masters degree Computer Science course. The app is run with Node.js, and uses Bootstrap and jQuery in the views.



## Installation
To install (Requires Node.JS installed):
```bash
cd EventsViewer
npm install
```

To start the server (localhost port 8090).
```bash
npm start
```
Navigate to localhost:8090/events2017/index.html in your browser.

## Usage

The app is an events viewer and provides search functionality for existing events on the local JSON flat-file storage system. An admin  page exists, and provides functionality for updating/adding/removing events or venues. To access the admin page, a login is required, which returns a cookie as a token with a life of 2 hours.

The login for the admin page is:
* username - user
* password - password

The app is meant as a demo and so account handling is not a priority.

const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const ip = require('ip');
let eventsObj = JSON.parse(fs.readFileSync('./events.json', 'utf8'));
let venuesObj = JSON.parse(fs.readFileSync('./venues.json', 'utf8'));
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

// set port
const port = process.env.port || process.env.VCAP_APP_PORT  || 8090;

// jwt secret
const secret = 'secret';

console.log(ip.address());

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

/* set base url to deliver index.html page */
app.get('/events2017/index.html', function(req, resp) {
    fs.readFile('../Views/index.html', null, function(error, data) {
        if (error) {
            resp.writeHead(404);
            resp.write('File not found');
        } else {
            resp.writeHead(200, {'Content-Type': 'text/html'});
            resp.write(data);
        }
        resp.end();
    });
});

/* set base url to deliver login.html page */
app.get('/events2017/login.html', function(req, resp) {
    fs.readFile('../Views/login.html', null, function(error, data) {
        if (error) {
            resp.writeHead(404);
            resp.write('File not found');
        } else {
            resp.writeHead(200, {'Content-Type': 'text/html'});
            resp.write(data);
        }
        resp.end();
    });
});

/* set base url to deliver admin.html page */
app.get('/events2017/admin.html', function(req, resp) {
    fs.readFile(('../Views/admin.html'), null, function(error, data) {
        if (error) {
            resp.writeHead(404);
            resp.write('File not found');
        } else {
            resp.writeHead(200, {'Content-Type': 'text/html'});
            resp.write(data);
        }
        resp.end();
    });
});

/* url to authenticate users */
app.get('/events2017/authenticate', function(req, resp) {
    //resp.write('accessed authenticate route');
    console.log(req.headers);
    let auth_token = req.headers.authorization || null;
    let ip = req.headers.ip || null;
    console.log(auth_token);
    console.log(ip);
    if (checkToken(auth_token, ip)) {
        console.log('token permitted');
        resp.statusMessage = 'permitted';
        resp.status(200).end();
    } else {
        console.log('token denied');
        resp.statusMessage = 'denied';
        resp.status(400).end()
    }
});

/* receive get request from admin page to add venue */
app.post('/events2017/venues/add', function(req, resp){
    console.log('add venue request made');
    console.log(req.body);

    let responseData;
    const token = req.body.auth_token || null;
    const name = req.body.name;
    const postcode = req.body.postcode;
    const town = req.body.town;
    const url = req.body.url;
    const icon = req.body.icon;
    const address = req.connection.remoteAddress;
    console.log('address: ' + address);

    // create get request to separate authenticate service
    const options = {
        host:''+ip.address(),
        //host: 'web-assignment.eu-gb.mybluemix.net',
        port: port,
        path: '/events2017/authenticate',
        headers: {
            ip: address,
            Authorization: token
        }
    };
    http.get(options, function(res) {
        console.log("Got response: " + res.statusCode);
        if (res.statusCode === 200) {
            // token was accepted
            // if not all parameters are provided, return error message and end, otherwise pass
            if (!checkParametersAddVenue(name)) {
                console.log('missing parameters: access denied');
                responseData = {
                    "error": "missing parameters in form, or date of wrong format"
                };
                console.log('response data: ' + responseData);
                resp.statusCode = 400;
                resp.setHeader('Content-Type', 'application/json');
                resp.json(responseData);

            } else {
                // all parameters passed and token validated
                venuesObj = JSON.parse(fs.readFileSync('./venues.json', 'utf8'));

                let length = Object.keys(venuesObj.venues).length + 1;
                let venue_id = 'v_' + length;
                // create json data object
                const data = {
                    "name": name,
                    "postcode": postcode,
                    "town": town,
                    "url": url,
                    "icon": icon
                };
                console.log('venue added: ' + JSON.stringify(data, null, 2));
                venuesObj.venues[venue_id] = data;
                const out = JSON.stringify(venuesObj, null, 2);
                fs.writeFile('venues.json', out, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });
                // create response string
                responseData = {
                    "status": "success"
                };
                console.log('response data: ' + responseData);
                resp.statusCode = 200;
                resp.setHeader('Content-Type', 'application/json');
                resp.json(responseData)
            }

        } else if (res.statusCode === 400) {
            // token was rejected
            console.log('invalid token: access denied - redirecting to login page');
            responseData = {
                "error": "not authorised, incorrect token"
            };
            resp.statusCode = 400;
            resp.setHeader('Content-Type', 'application/json');
            resp.json(responseData);
        } else {
            console.log('no response from authenticate server or response different to 200/400')

        }
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
});

/* receive get request from admin page to add event */
app.post('/events2017/events/add', function(req, resp){
    console.log('add event to venue request made');
    console.log(req.body);

    let data;
    let responseData;
    const token = req.body.auth_token || null;
    const id = req.body.event_id;
    const title = req.body.title;
    const venue_id = req.body.venue_id;
    const date = req.body.date;
    const url = req.body.url;
    const blurb = req.body.blurb;
    const v_name = '';
    const v_postcode = '';
    const v_town = '';
    const v_url = '';
    const v_icon = '';
    const address = req.connection.remoteAddress;
    console.log('address: ' + address);

    // create get request to separate authenticate service
    const options = {
        host:''+ip.address(),
        //host: 'web-assignment.eu-gb.mybluemix.net',
        port: port,
        path: '/events2017/authenticate',
        headers: {
            ip: address,
            Authorization: token
        }
    };
    http.get(options, function(res) {
        console.log("Got response: " + res.statusCode);

        if (res.statusCode === 200) {
            // token was accepted
            // if not all parameters are provided, return error message and end, otherwise pass
            if (!checkParametersAddEvent(id, title, venue_id, date)) {
                console.log('missing parameters: access denied');
                responseData = {
                    "error": "missing parameters in form, or date of wrong format"
                };
                resp.statusCode = 400;
                resp.setHeader('Content-Type', 'application/json');
                resp.json(responseData);

            } else {
                // all parameters passed and token validated
                console.log('token accepted: adding event');
                // create response string
                responseData = {
                    "status": "success"
                };
                // will overwrite data in an event if the posted event id already exists
                addVenueDataToEvent(id, title, blurb, date, url, venue_id);

                if (eventUpdated) {
                    // event venue information was updated
                    let dataWrite = JSON.stringify(eventsObj, null, 2);
                    fs.writeFile('events.json', dataWrite, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                    resp.statusCode = 200;
                    resp.setHeader('Content-Type', 'application/json');
                    resp.json(responseData);
                } else {
                    // venue of event was not updated, so leave venue details in event blank
                    // create json object
                    data = {
                        "event_id": id,
                        "title": title,
                        "blurb": blurb,
                        "date": date,
                        "url": url,
                        "venue": {
                            "name": v_name,
                            "postcode": v_postcode,
                            "town": v_town,
                            "url": v_url,
                            "icon": v_icon,
                            "venue_id": venue_id
                        }
                    };
                    // add json data object to data from file
                    eventsObj.events[eventsObj.events.length] = data;

                    // add venue data to event and rewrite file
                    addVenueDataToEvent(id, title, blurb, date, url, venue_id);
                    fs.writeFile('events.json', JSON.stringify(eventsObj, null, 2), function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                    resp.statusCode = 200;
                    resp.setHeader('Content-Type', 'application/json');
                    resp.json(responseData);
                }
            }
        }
        else if (res.statusCode === 400) {
            // token was rejected
            console.log('invalid token: access denied - redirecting to login page');
            responseData = {
                "error": "not authorised, incorrect token"
            };
            resp.statusCode = 400;
            resp.setHeader('Content-Type', 'application/json');
            resp.json(responseData);
        } else {
            console.log('no response from authenticate server or response different to 200/400')
        }
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
});

/* receive login request from admin login page and redirect to admin if validated */
app.post('/events2017/admin/login', function(req, resp){
    console.log('login request made');
    let responseData;
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;

    const address = req.connection.remoteAddress;
    const token = getAuthToken(address);

    console.log(address);
    console.log('username: ' + username);
    console.log('password: ' + password);

    if (checkParametersLogin(username, password)) {
        resp.setHeader('Content-Type', 'text/html');
        //resp.cookie('token', token, { maxAge: 2*60*60*1000, httpOnly: true });
        resp.cookie('token' , token, {
            maxAge : 2*60*60*1000
        });
        responseData = token;
        console.log('successful login');
        console.log('token sent: ' + responseData);
        resp.send(responseData);
    } else {
        resp.setHeader('Content-Type', 'application/json');
        responseData = {
            "error": "incorrect username or password"
        };
        console.log('login failed');
        resp.statusCode = 400;
        resp.json(responseData);
    }
});

/* get all venues by responding with static venues json file */
app.get('/events2017/venues', function(req, resp){
    console.log('sending venues text');
    resp.writeHead(200, {'Content-Type': 'application/json'});
    resp.write(JSON.stringify(venuesObj, null, 2));
    resp.end();
});

/* get all events by responding with static events json file */
app.get('/events2017/events', function(req, resp){
    console.log('sending events text');
    resp.writeHead(200, {'Content-Type': 'application/json'});
    getAllCorrectInformationEvents();
    resp.write(JSON.stringify(eventsObj, null, 2));
    resp.end();
});

/* get listener for the search bar in index.html */
app.get('/events2017/events/search', function(req, resp){
    console.log('search term: ' + req.query.search + " date term: " + req.query.date);
    /* if search parameter is empty string, return all events */
    if ((req.query.search === '' || req.query.search === undefined) && (req.query.date === '' || req.query.date === undefined)) {
        fs.readFile('./events.json', null, function(error, data) {
            if (error) {
                resp.writeHead(404);
                resp.write('File not found');
            } else {
                resp.write(data);
            }
            resp.end();
        });
    }
    else {
        let returnString = '{"events": [';
        let date;
        if (req.query.date === undefined) {
            date = '';
        } else if (req.query.date.length < 10) {
            date = '';
        } else {
            date = req.query.date.substring(0, 10);
        }
        console.log('date: ' + date);
        let first = true;
        getAllCorrectInformationEvents();

        for (let i = 0; i < eventsObj.events.length; i++) {

            if (req.query.date === '' || req.query.date === undefined) {
                // if date parameter is empty, only check search string for search
                if (eventsObj.events[i].title.indexOf(req.query.search) !== -1) {
                    // search for venue with id provided, if it exists, add its data to responseData
                    if (first) {
                        returnString += JSON.stringify(eventsObj.events[i]);
                        first = false;
                    } else {
                        returnString += ', ' + JSON.stringify(eventsObj.events[i]);
                    }
                }

            } else if (req.query.search === '' || req.query.search === undefined) {
                // if search parameter is empty, only check search string for date
                if (eventsObj.events[i].date.indexOf(date) !== -1) {
                    // search for venue with id provided, if it exists, add its data to responseData
                    if (first) {
                        returnString += JSON.stringify(eventsObj.events[i]);
                        first = false;
                    } else {
                        returnString += ', ' + JSON.stringify(eventsObj.events[i]);
                    }
                }

            } else {
                // otherwise search string for search and date parameters
                if (eventsObj.events[i].title.indexOf(req.query.search) !== -1 && eventsObj.events[i].date.indexOf(date) !== -1) {
                    // search for venue with id provided, if it exists, add its data to responseData
                    if (first) {
                        returnString += JSON.stringify(eventsObj.events[i]);
                        first = false;
                    } else {
                        returnString += ', ' + JSON.stringify(eventsObj.events[i]);
                    }
                }
            }
        }
        returnString += ']}';
        if (returnString === '{"events": []}') {
            console.log('No Results Found...');
        }
        resp.setHeader('Content-Type', 'application/json');
        resp.statusCode = 200;
        console.log('returnString: ' + returnString);
        console.log('sending search results');
        resp.write(returnString);
        resp.end();
    }

});

// get request for search Eventful API - avoid CORS problems on front end
app.get('/events2017/events/searchEventful', function(req, resp) {
    resp.setHeader('Content-Type', 'application/json');
    let searchTerm = req.query.search;
    let dateTerm = req.query.date;
    let url = 'http://api.eventful.com/json/events/search?app_key=Nj4ZQFX7fgHTn94H&keywords=music+' + searchTerm + "&date=" + dateTerm + '&location=UK';
    console.log('request url: ' + url);
    const options = {
        host: 'api.eventful.com',
        path: '/json/events/search?app_key=Nj4ZQFX7fgHTn94H&keywords=music+' + searchTerm + "&date=" + dateTerm + '&location=UK',
        method: 'GET'
    };
    let body = '';
    http.get(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            console.log(body);
            console.log('got all chunks');
            resp.json(JSON.parse(body));
        });
    });
});

app.get('/events2017/events/get/:event_id', function(req, resp){
    const id = '' + req.params.event_id;
    console.log(id);
    resp.setHeader('Content-Type', 'application/json');
    let found = false;
    let returnString = '';
    for (let i = 0; i < eventsObj.events.length; i++) {
        if (eventsObj.events[i].event_id.indexOf(id) !== -1) {
            resp.statusCode = 200;
            returnString = eventsObj.events[i];
            found = true;
        }
    }
    if (!found) {
        resp.statusCode = 400;
        returnString = {
            "error": "no such event with ID: " + id
        }
    }
    console.log('getting event with id: ' + id);
    resp.json(returnString);
    resp.end();
});


// post to take username, password and address and return an auth token
function getAuthToken(address) {
    return jwt.sign({ address:address }, secret, { expiresIn:'2h' });
}

// get which takes an auth token and returns whether token is valid or not
function checkToken(token, address) {
    // regular expression to check address
    regex = /129\.234\.\d{1,3}\.\d{1,3}$/;
    if (token === 'concertina' || address.search(regex) !== -1) {
        return true;
    } else {
        try {
            jwt.verify(token, secret);
            return true;
        }
        catch (err) {
            return false;
        }
    }
}

function checkDateFormat(date){
    if (date === undefined) {
        return false;
    } else if (date.length > 10) {
        date = date.substring(0, 10);
    }
    return !isNaN(Date.parse(date));
}

function checkParametersAddEvent(id, title, vid, date) {
    // if all required fields are not empty and date is of correct format then return true
    return !(id === '' || id === undefined || title === '' || title === undefined || vid === '' || vid === undefined|| date === '' || !checkDateFormat(date));
}

function checkParametersAddVenue(name) {
    // if all required fields are not empty then return true
    return !(name === '' || name === undefined);
}

function checkParametersLogin(user, pass) {
    const account = {
        username: 'william',
        password: 'password'
    };
    // if username and password match up then return true
    return (user === account.username && pass === account.password);
}

function getAllCorrectInformationEvents() {
    console.log('adding correct venue information to each event');
    for (let i = 0; i < eventsObj.events.length; i++) {
        addVenueDataToEvent(eventsObj.events[i].event_id, eventsObj.events[i].title, eventsObj.events[i].blurb, eventsObj.events[i].date, eventsObj.events[i].url, eventsObj.events[i].venue.venue_id);
    }
    // update and save
    fs.writeFile('events.json', JSON.stringify(eventsObj, null, 2), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    console.log('correct venue information added to each event')
}

let eventUpdated = false;
let eventVenueUpdated = false;
function addVenueDataToEvent(id, title, blurb, date, url, venue_id) {
    let data = '';
    // if event id is already declared, update event and corresponding venue
    eventUpdated = false;
    eventVenueUpdated = false;
    for (let i = 0; i < eventsObj.events.length; i++) {
        if (eventsObj.events[i].event_id === id) {
            eventUpdated = true;
            // iterate through venues
            for (let i = 1; i <= Object.keys(venuesObj.venues).length; i++) {
                let selector = 'v_' + i;
                // if venue exists, append its data to the event object
                if (selector === venue_id) {
                    data = {
                        "event_id": id,
                        "title": title,
                        "blurb": blurb,
                        "date": date,
                        "url": url,
                        "venue": {
                            "name": venuesObj.venues[selector].name,
                            "postcode": venuesObj.venues[selector].postcode,
                            "town": venuesObj.venues[selector].town,
                            "url": venuesObj.venues[selector].url,
                            "icon": venuesObj.venues[selector].icon,
                            "venue_id": venue_id
                        }
                    };
                    eventVenueUpdated = true;
                }
            }
            // if venue doesn't exist, append the new venue id to the event and leave other information blank
            if (!eventVenueUpdated) {
                data = {
                    "event_id": id,
                    "title": title,
                    "blurb": blurb,
                    "date": date,
                    "url": url,
                    "venue": {
                        "name": "",
                        "postcode": "",
                        "town": "",
                        "url": "",
                        "icon": "",
                        "venue_id": venue_id
                    }
                };
            }
            // update data at array index to
            eventsObj.events[i] = data;
        }
    }
}

app.listen(port);
console.log('Server started on port ' + port + '...');
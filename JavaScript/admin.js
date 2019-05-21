// parameter for returned events list in get events
let eventObj;
// parameter for returned venues list in get venues
let venueObj;

// only used to form ids in the event that more than one event is returned from the search
let numberOfEvents;
let numberOfVenues;

// variables for each attribute of event object - used to create rows in results table and data on click
let event_id;
let title;
let blurb;
let date;
let e_url;
let venue;
let v_postcode;
let v_town;
let v_url;
let v_icon;
let v_id;

// variables for each attribute of the venue object, used to create rows in results table and data on click
let venue_id;
let name;
let town;
let postcode;
let url;
let icon;

// html string used to build table in search view
let htmlStringEvent;
let infoStringsEvents = [];
let htmlStringVenue;
let infoStringsVenues = [];

// get cookie value by name
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

let myCookie = getCookie("token");
console.log('cookie value: ' + myCookie);
if (myCookie === "") {
    window.location.replace('/events2017/login.html');
}

/* when submit button on add venue form is clicked, perform add venue function */
$('#venueAddBtn').click(function() {
    const $v_name = $('#v_name');
    const $v_postcode = $('#v_postcode');
    const $v_town = $('#v_town');
    const $v_url = $('#v_url');
    const $v_icon = $('#v_icon');
    const cookie_val = getCookie("token");
    let v_name = $v_name.val();
    let v_postcode = $v_postcode.val();
    let v_town = $v_town.val();
    let v_url = $v_url.val();
    let v_icon = $v_icon.val();

    // conditions must be filled before request can be performed
    if (v_name === '') {
        // if name is empty, don' make request
        alert('Name is a required parameters!')
    } else {
        const http = new XMLHttpRequest();
        const url = "/events2017/venues/add";
        const details = 'auth_token=' + cookie_val + '&name=' + v_name + '&postcode=' + v_postcode + '&town=' + v_town + '&url=' + v_url + '&icon=' + v_icon;
        console.log(details);
        http.onreadystatechange = function () {//Call a function when the state changes.
            if (http.readyState === 4 && http.status === 200) {
                alert('200 OK - response from server: ' + http.responseText);
                // if response is good
                //$v_at.val('');
                $v_name.val('');
                $v_postcode.val('');
                $v_town.val('');
                $v_url.val('');
                $v_icon.val('');
            } else if (http.readyState === 4 && http.status === 400) {
                alert('400 Bad Request - response from server: ' + http.responseText);
                if (http.responseText === '{"error":"missing parameters in form, or date of wrong format"}') {
                    // missing parameters so don't do anything
                    console.log('missing parameters in form');
                } else if (http.responseText === '{"error":"not authorised, incorrect token"}'){
                    // incorrect token so redirect to login page
                    window.location.replace('/events2017/login.html');
                }
            }
        };
        http.open("POST", url, true);
        // http.setRequestHeader("Authorization", 'Bearer ' + getCookie('token'));
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http.send(details);
    }
});


/* when submit button on add event form is clicked, perform add venue function */
$('#eventAddBtn').click(function() {
    const $e_id = $('#e_id');
    const $e_title = $('#e_title');
    const $v_id = $('#v_id');
    const $e_url = $('#e_url');
    const $e_blurb = $('#e_blurb');
    const cookie_val = getCookie("token");
    let e_id = $e_id.val();
    let e_title = $e_title.val();
    let v_id = $v_id.val();
    let e_date = year + "-" + month + "-" + day;
    let e_url = $e_url.val();
    let e_blurb = $e_blurb.val();

    // condtitions must be fulfilled before request can be made
    if (e_id === '' || e_title === '' || v_id === '' || day === 0 || month === 0 || year === 0) {
        // if auth token, e_id, title, v_id or date are empty dont make request
        alert('Event ID, Event Title, Venue ID and Event Date are required parameters!')
    } else {
        const http = new XMLHttpRequest();
        const url = "/events2017/events/add";
        const details = 'auth_token=' + cookie_val + '&event_id=' + e_id + '&title=' + e_title + '&venue_id=' + v_id + '&date=' + e_date + 'T00:00:00Z&url=' + e_url + '&blurb=' + e_blurb;
        console.log(details);
        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState === 4 && http.status === 200) {
                alert('200 OK - response from server: ' + http.responseText);
                // reset values in form
                $e_id.val('');
                $e_title.val('');
                $v_id.val('');
                day = 0;
                month = 0;
                year = 0;
                $('#day').html('Day ' + '<span class="caret"></span>');
                $('#month').html('Month ' + '<span class="caret"></span>');
                $('#year').html('Year ' + '<span class="caret"></span>');
                $e_url.val('');
                $e_blurb.val('');
            } else if (http.readyState === 4 && http.status === 400) {
                alert('400 Bad Request - response from server: ' + http.responseText);
                if (http.responseText === '{"error":"missing parameters in form, or date of wrong format"}') {
                    // missing parameters so don't do anything
                    console.log('missing parameters in form');
                } else if (http.responseText === '{"error":"not authorised, incorrect token"}'){
                    // incorrect token so redirect to login page
                    window.location.replace('/events2017/login.html');
                }
            }
        };
        http.open("POST", url, true);
        // http.setRequestHeader("Authorization", 'Bearer ' + getCookie('token'));
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http.send(details);
    }
});


/* when get events button is clicked, retrieve html */
let eventBoolean = true;
$('#getEvents').click(function() {
    if (eventBoolean) {
        /* if not been clicked do: */
        $(this).val("Hide Events");
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                console.log(xhttp.responseText);
                $('#headerGetEvents').html("Events List: ");
                eventObj = JSON.parse(xhttp.responseText);
                createEventTable();
                console.log('json object returned: ' + eventObj);
                $('#eventsListCSS').html(htmlStringEvent);
            }
        };
        xhttp.open('GET', '/Events2017/events', true);
        xhttp.send();
        eventBoolean = false;
    }
    /* if already been clicked do: */
    else {
        $(this).val("View all Events");
        $('#headerGetEvents').html('');
        $('#eventsListCSS').html('');
        eventBoolean = true;
    }
});


/* when get venues button is clicked, retrieve html for venues and display*/
let venueBoolean = true;
$('#getVenues').click(function() {
    /* if not been clicked do: */
    if (venueBoolean) {
        $(this).val("Hide Venues");
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                console.log(xhttp.responseText);
                $('#headerGetVenues').html("Venues List: ");
                venueObj = JSON.parse(xhttp.responseText);
                createVenueTable();
                console.log('html string venue: ' + htmlStringVenue);
                $('#venuesListCSS').html(htmlStringVenue);
            }
        };
        xhttp.open('GET', '/Events2017/venues', true);
        xhttp.send();
        venueBoolean = false;
    }
    /* if already been clicked do: */
    else {
        $(this).val("View all Venues");
        $('#headerGetVenues').html('');
        $('#venuesListCSS').html('');
        venueBoolean = true;
    }
});

/* function to create a table of all events */
function createEventTable() {
    htmlStringEvent = '<table class="table table-bordered table-hover">\n<thead>\n<tr>\n<th>Event</th>\n<th>Date</th>\n' +
        '<th>Venue</th>\n</tr>\n</thead>\n<tbody>';

    // returned json object is a list of all events
    numberOfEvents = eventObj.events.length;
    for (let idnum = 1; idnum <= numberOfEvents; idnum++) {
        event_id = eventObj.events[idnum-1].event_id;
        title = eventObj.events[idnum-1].title;
        blurb = eventObj.events[idnum-1].blurb;
        date = eventObj.events[idnum-1].date;
        e_url = eventObj.events[idnum-1].url;
        venue = eventObj.events[idnum-1].venue.name;
        v_postcode = eventObj.events[idnum-1].venue.postcode;
        v_town = eventObj.events[idnum-1].venue.town;
        v_url = eventObj.events[idnum-1].venue.url;
        v_icon = eventObj.events[idnum-1].venue.icon;
        v_id = eventObj.events[idnum-1].venue.venue_id;

        let trID = '' + (idnum - 1);
        infoStringsEvents[idnum - 1] = 'ID: ' + event_id + '\n' +
            'Title: ' + title + '\n' +
            'Blurb: ' + blurb + '\n' +
            'Date: ' + date + '\n' +
            'URL: ' + e_url + '\n' +
            'Venue: ' + venue + '\n' +
            '   Venue Postcode: ' + v_postcode + '\n' +
            '   Venue Town: ' + v_town + '\n' +
            '   Venue URL: ' + v_url + '\n' +
            '   Venue Icon: ' + v_icon + '\n' +
            '   Venue ID: ' + v_id;
        console.log("infoString: " + infoStringsEvents[idnum - 1]);
        htmlStringEvent += '<tr class="tre" id="' + trID + '"><td>' + title + '</td><td>' + date + '</td><td>' + venue + '</td></tr>';
    }
    htmlStringEvent += '</tbody></table></div>';
}

/* function to create a table of all venues */
function createVenueTable() {
    htmlStringVenue = '<table class="table table-bordered table-hover">\n<thead>\n<tr>\n<th>Name</th>\n<th>Town</th>\n' +
        '<th>Postcode</th>\n</tr>\n</thead>\n<tbody>';

    // returned json object is a list of events
    numberOfVenues = Object.keys(venueObj.venues).length;
    let selector = '';
    console.log('number of venues in object: ' + numberOfVenues);
    for (let idnum = 1; idnum <= numberOfVenues; idnum++) {
        selector = 'v_' + idnum;
        venue_id = selector;
        name = venueObj.venues[selector].name;
        town = venueObj.venues[selector].town;
        postcode = venueObj.venues[selector].postcode;
        url = venueObj.venues[selector].url;
        icon = venueObj.venues[selector].icon;

        let trID = '' + (idnum - 1);
        infoStringsVenues[idnum - 1] = 'Venue ID: ' + venue_id + '\n' +
            'Name: ' + name + '\n' +
            'Town: ' + town + '\n' +
            'Postcode: ' + postcode + '\n' +
            'URL: ' + url + '\n' +
            'Icon: ' + icon;
        console.log("infoString: " + infoStringsVenues[idnum - 1]);
        htmlStringVenue += '<tr class="trv" id="' + trID + '"><td>' + name + '</td><td>' + town + '</td><td>' + postcode + '</td></tr>';
    }
    htmlStringVenue += '</tbody></table></div>';
}


/* jQuery code to provide extra info on events when event row from table is clicked */
$(document.body).on('click', '.tre',function() {
    alert(infoStringsEvents[$(this).attr('id')]);
});

/* jQuery code to provide extra info on events when event row from table is clicked */
$(document.body).on('click', '.trv',function() {
    alert(infoStringsVenues[$(this).attr('id')]);
});


// when logout button is clicked, set cookie browser to be expired, and redirect to login page
$('#logoutBtn').click(function() {
    document.cookie = "token=''; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.replace("/events2017/login.html");
});



/* fill the years dropdown */
let currentyear = parseInt('' + (new Date()).getFullYear());
const $yearsDropdown = $('#yeardropdown');
$yearsDropdown.append("<li class=\"yearselect\"><a href=\"#\">" + currentyear + "</a></li>");
let numYears = 10;
for (let i = 1; i < numYears; i++) {
    $yearsDropdown.append("<li class=\"yearselect\"><a href=\"#\">" + (currentyear + i) + "</a></li>");
}

/* get and set values from date drop downs for use in search */
/* function to take and set value of selected day in date selector */
let day = 0;
$('.dayselect').click(function() {
    day = $(this).text();
    $('#day').html(day + ' ' + '<span class="caret"></span>');
});
/* function to take and set value of selected month in date selector */
let month = 0;
$('.monthselect').click(function() {
    month = $(this).text();
    $('#month').html(month + ' ' + '<span class="caret"></span>');
});
/* function to take and set value of selected year in date selector */
let year = 0;
$('.yearselect').click(function() {
    year = $(this).text();
    $('#year').html(year + ' ' + '<span class="caret"></span>');
});

$(document).ready(function() {
    $(".dropdown-toggle").dropdown();
});
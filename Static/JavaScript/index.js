// parameter in the search box
let searchTxt = '';
let dateTxt = '';
let dateTxtEventful = '';

// parameter for returned string (potentially an array of events)
let eventObj;

// only used to form ids in the event that more than one event is returned from the search
let numberOfObjects;
let numberOfEventfulObjects;

// variables for each attribute of event object - used to create rows in results table and data on click
let event_id;
let title;
let blurb;
let date;
let url;
let venue;
let v_postcode;
let v_town;
let v_url;
let v_icon;
let v_id;

//variables for each attribute of returned Eventful API object
let eventfulTitle;
let eventfulDate;
let eventfulURL;

// html string used to build table in search view
let htmlString;
let eventfulString;
let infoStrings = [];

// boolean to include api results in search
let APIBooleanChecked = false;

// get data using search bar
function performSearch(searchTerm, dateTerm) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            if (searchTerm === '' && dateTerm === '') {
                $('#headerGetSearch').html("Viewing all Events: ");
            } else {
                $('#headerGetSearch').html("Search Results for '" + searchTerm + "' and date - '" + dateTerm + "': ");
            }
            console.log(xhttp.responseText);
            if (xhttp.responseText === '{"events": []}') {
                $('#viewSearch').html('No Results Found...');
            } else {
                eventObj = JSON.parse(xhttp.responseText);
                createTable();
                $('#viewSearch').html(htmlString);
            }
        }
    };
    console.log('/Events2017/events/search?search=' + searchTerm + "&date=" + dateTerm);
    xhttp.open('GET', ('/Events2017/events/search?search=' + searchTerm + "&date=" + dateTerm), true);
    xhttp.send();
}

// get data from EVENTFUL API
function performSearchEventfulAPI(searchTerm, dateTerm) {
    if (APIBooleanChecked) {
        if (searchTerm === '' && dateTerm === '') {
            // do nothing - no results from Eventful API
            $('#headerGetAPI').html("Search Results from Eventful API for '" + searchTerm + "' and date - '" + dateTerm + "': ");
            $('#viewAPI').text("No results found");
        } else {
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    console.log('response text: ' + xhttp.responseText);
                    let jsonObject = JSON.parse(xhttp.responseText);
                    createTableEventful(jsonObject);
                    $('#headerGetAPI').html("Search Results from Eventful API for '" + searchTerm + "' and date - '" + dateTerm + "': ");
                    $('#viewAPI').html(eventfulString);
                }
            };
            console.log('/events2017/events/searchEventful?search=' + searchTerm + "&date=" + dateTerm + '&location=UK');
            xhttp.open('GET', ('/events2017/events/searchEventful?search=' + searchTerm + "&date=" + dateTerm + '&location=UK'), true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send();
        }
    } else {
        // do nothing - no results from Eventful API
        $('#headerGetAPI').html("");
        $('#viewAPI').text("");
    }
}

/* when a key is pressed in search box, perform live search function */
const $searchBox = $('#searchBox');
$searchBox.on("input", function() {
    console.log("typing into box");
    if ($(this).val() === '') {
        searchTxt = '';
    } else {
        searchTxt = $(this).val();
    }
    updateDateString();
    performSearch(searchTxt, dateTxt);
    performSearchEventfulAPI(searchTxt, dateTxtEventful);
});
/* if search button is clicked and no parameters are given then return all events */
/* also reset date drop downs */
$('#searchBtn').click(function () {
    if ($searchBox.val() === '') {
        searchTxt = '';
    } else {
        searchTxt = $searchBox.val();
    }
    updateDateString();
    performSearch(searchTxt, dateTxt);
    performSearchEventfulAPI(searchTxt, dateTxtEventful);
});

function updateDateString() {
    if (day === 0 || month === 0 || year === 0) {
        //do nothing
    } else {
        dateTxt = '' + year + '-' + month + '-' + day;
        dateTxtEventful = '' + year + month + day + '00-' + year + month + day + '00';
    }
}

/* when date search button is clicked, perform search function */
$('#dateBtn').click(function() {
    updateDateString();
    performSearch(searchTxt, dateTxt);
    if (APIBooleanChecked) {
        performSearchEventfulAPI(searchTxt, dateTxtEventful);
    }
});

/* when x button is clicked by date, clear date numbers and set dateTxt = null */
$('#clearDateBtn').click(function() {
    day = 0;
    month = 0;
    year = 0;
    $('#day').html('Day ' + '<span class="caret"></span>');
    $('#month').html('Month ' + '<span class="caret"></span>');
    $('#year').html('Year ' + '<span class="caret"></span>');
    dateTxt = '';
    dateTxtEventful = '';
});

/* fill the years dropdown */
let currentyear = parseInt('' + (new Date()).getFullYear());
const $yearsDropdown = $('#yeardropdown');
$yearsDropdown.append("<li class=\"yearselect\"><a href=\"#\">" + currentyear + "</a></li>");
const numYears = 10;
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

/* function to create a table based on results from search */
function createTable() {
    htmlString = '<table class="table table-bordered table-hover">\n<thead>\n<tr>\n<th>Event</th>\n<th>Date</th>\n' +
        '<th>Venue</th>\n</tr>\n</thead>\n<tbody>';

    // returned json object is a list of all events
    numberOfObjects = eventObj.events.length;
    for (let idnum = 1; idnum <= numberOfObjects; idnum++) {
        event_id = eventObj.events[idnum - 1].event_id;
        title = eventObj.events[idnum - 1].title;
        blurb = eventObj.events[idnum - 1].blurb;
        date = eventObj.events[idnum - 1].date;
        url = eventObj.events[idnum - 1].url;
        venue = eventObj.events[idnum - 1].venue.name;
        v_postcode = eventObj.events[idnum - 1].venue.postcode;
        v_town = eventObj.events[idnum - 1].venue.town;
        v_url = eventObj.events[idnum - 1].venue.url;
        v_icon = eventObj.events[idnum - 1].venue.icon;
        v_id = eventObj.events[idnum - 1].venue.venue_id;

        let trID = '' + (idnum - 1);
        infoStrings[idnum - 1] = 'ID: ' + event_id + '\n' +
            'Title: ' + title + '\n' +
            'Blurb: ' + blurb + '\n' +
            'Date: ' + date + '\n' +
            'URL: ' + url + '\n' +
            'Venue: ' + venue + '\n' +
            '   Venue Postcode: ' + v_postcode + '\n' +
            '   Venue Town: ' + v_town + '\n' +
            '   Venue URL: ' + v_url + '\n' +
            '   Venue Icon: ' + v_icon + '\n' +
            '   Venue ID: ' + v_id;
        htmlString += '<tr class="tre" id="' + trID + '"><td>' + title + '</td><td>' + date + '</td><td>' + venue + '</td></tr>';
    }
    htmlString += '</tbody></table></div>';
}

function createTableEventful(object) {
    if (object.total_items === '0') {
        //do nothing
    } else {
        eventfulString = '<table class="table table-bordered table-hover">\n<thead>\n<tr>\n<th>Event</th>\n<th>Date</th>\n' +
            '<th>URL</th>\n</tr>\n</thead>\n<tbody>';

        numberOfEventfulObjects = object.events.event.length;
        for (let i = 0; i < numberOfEventfulObjects; i++) {
            eventfulTitle = object.events.event[i].title;
            eventfulDate = object.events.event[i].start_time;
            eventfulURL = object.events.event[i].url;

            eventfulString += '<tr class="tr"><td>' + eventfulTitle + '</td><td>' + eventfulDate + '</td><td><a href="' + object.events.event[i].url + '">' + object.events.event[i].url + '</a></td></tr>';

        }
        eventfulString += '</tbody></table></div>';
    }
}

/* when checkbox for api is clicked, include its results */
$('#includeAPIBox').click(function () {
    if (APIBooleanChecked) {
        $('#iconAPI').attr('class', 'glyphicon glyphicon-unchecked');
        APIBooleanChecked = false;
    } else {
        $('#iconAPI').attr('class', 'glyphicon glyphicon-check');
        APIBooleanChecked = true;
    }
});

/* jQuery code to provide extra info on events when event row from table is clicked */
$(document.body).on('click', '.tre',function() {
    alert(infoStrings[$(this).attr('id')]);
});

$(document).ready(function() {
    $(".dropdown-toggle").dropdown();
});
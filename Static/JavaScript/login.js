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

function setCookie(cname, cvalue, exhours) {
    let d = new Date();
    d.setTime(d.getTime() + (exhours**60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

let myCookie = getCookie("token");
console.log(myCookie);
if (myCookie !== '') {
    window.location.replace('/events2017/admin.html');
}
// otherwise ignore

/* when submit button on add event form is clicked, perform add venue function */
$('#loginBtn').click(function() {
    const $username = $('#username');
    const $password = $('#pwd');
    let username = $username.val();
    let password = $password.val();

    console.log('username: ' + username);
    console.log('password: ' + password);
    console.log('request to login made');
    // conditions must be fulfilled before request can be made
    if (username === '' || password === '') {
        // if username or password are empty, don't send login request
        alert('Please enter a username and password')
    } else {
        $username.val('');
        $password.val('');

        const http = new XMLHttpRequest();
        const url = "/events2017/admin/login";
        const details = {username:username, password:password};
        console.log(details);
        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState === 4 && http.status === 200) {
                console.log(http.responseText);
                setCookie('token', http.responseText, 2);
                console.log(document.cookie);
                window.location.replace('/events2017/admin.html');


            } else if (http.readyState === 4 && http.status === 400) {
                alert('username or password incorrect');
            }

        };
        http.open("POST", url, true);
        http.setRequestHeader("Content-type", "application/json");
        http.send(JSON.stringify(details));

    }
});
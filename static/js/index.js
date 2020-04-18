/*
    First check user's local storage if the users has joined before
    If so, make a get request to get the chat template
*/

// TODO: history push and modifiy URLS
const displayName = localStorage.getItem('name');
if (displayName) {
    window.location = "/chat?name=" + displayName;
}



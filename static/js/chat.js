/*
    Handles user registration with a display name
    load the chat conten
*/
document.addEventListener('DOMContentLoaded', () => {
    const displayName = document.querySelector("#name").innerHTML;
    localStorage.setItem('name', displayName)
});

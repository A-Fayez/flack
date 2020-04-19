/*
    Handles user registration with a display name
    load the chat conten
*/
document.addEventListener('DOMContentLoaded', () => {

    const displayName = document.querySelector("#name").innerHTML;
    localStorage.setItem('name', displayName);

    // control displaying of popup
    const popup = document.querySelector(".popup");
    document.querySelector("#new-channel-btn").onclick = () => {
        popup.style.display = "flex";
    };
    document.querySelector("#cancel").onclick = () => {
        popup.style.display = "none";
    };

    // creating new channel
    document.querySelector("#create").onclick = () => {
        // TODO:  
    };


});

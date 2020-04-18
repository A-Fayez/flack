/*
    Handles user registration with a display name
    load the chat conten
*/
document.addEventListener('DOMContentLoaded', () => {
    const displayName = document.querySelector("#name").innerHTML;
    localStorage.setItem('name', displayName);

    document.querySelector("#new-channel-btn").onclick = () => {

        const windowParam = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
                             width=50%,height=50%,left=25%,top=25%`;

        window.open("/popup", "New Channel",  windowParam).focus();
    }

});

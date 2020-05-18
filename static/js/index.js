const display_name = localStorage.getItem('name');


if (display_name ) {
    window.location = "/chat?name=" + display_name;
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("form input[type='text']").focus();
});



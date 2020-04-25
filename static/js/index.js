const displayName = localStorage.getItem('name');
if (displayName) {
    window.location = "/chat?name=" + displayName;
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("form input[type='text']").focus();
});



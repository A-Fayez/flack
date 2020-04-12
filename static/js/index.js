/*
    First check user's local storage if the users has joined before
    sends the name field of the local storage along with a 
    get request with parameters
    the servers handle the value and determines which content to respond back
*/

document.addEventListener('DOMContentLoaded', () => {

    const param = new URLSearchParams({
        name: localStorage.getItem('name')
    });

    fetch('/content?' + param)
    .then(response => {
        const content = response.text()
        return content;
    }).then(html => {
        
        document.querySelector('.container').innerHTML = html;
    });

})


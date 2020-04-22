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
        const channelName = document.querySelector("#new-channel-name").value;
        postRequest("/channels", {"chName": channelName})
        .then(respone => { 
            if (respone.valid){
                console.log(respone);
            }
        })
        .catch(e => console.log(e));
    };
});

async function postRequest(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    return response.json();
}
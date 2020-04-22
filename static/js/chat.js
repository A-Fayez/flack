document.addEventListener('DOMContentLoaded', () => {

    const displayName = document.querySelector("#name").innerHTML;
    localStorage.setItem('name', displayName);

    // control displaying of popup
    const popup = document.querySelector(".popup");
    document.querySelector("#new-channel-btn").onclick = () => {
        popup.style.display = "flex";
        document.querySelector(".popup input").value = "";
        document.querySelector(".popup input").focus();
    };
    document.querySelector("#cancel").onclick = () => {
        popup.style.display = "none";
    };

    // creating new channel
    document.querySelector("#create").onclick = () => {
        const channelName = document.querySelector("#new-channel-name").value;
        postRequest("/channels", {"chName": channelName})
        .then(response => {
            if (response.valid) {
                newChannelCreated();
            }
            else if (!response.valid) {
                duplicateChannelName();
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

function duplicateChannelName() {
    // position: relative; margin: 0 auto; color: red; top:1100%;
    const label = document.createElement("label");
    label.innerHTML = "A channel with the same name already  exists.";
    label.style.color = "red";
    label.style.position = "relative";
    label.style.margin = "0 auto";
    label.style.top = "-50%";
    label.style.fontSize = "smaller";
    document.querySelector(".popup-content").appendChild(label);
}

// TODO:
function newChannelCreated() {
    const channel = document.createElement("li");
    document.querySelector(".channels").appendChild(channel);
}


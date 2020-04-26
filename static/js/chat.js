document.addEventListener('DOMContentLoaded', () => {

    const displayName = document.querySelector("#name").innerHTML;
    localStorage.setItem('name', displayName);

    // list previously created channels 
    fetch("/channels")
    .then(response => response.json())
    .then((channelsJSON) => {
        channelsJSON['channels'].forEach((channelName) => {
            createNewChannel(channelName);
        });
    })


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
                createNewChannel(channelName);
                popup.style.display = "none";
                console.log("channel created");
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

// returns a promise and use it to parse incoming messages as json
async function getMessages(channelName) {
    const url = new URL("/messages", window.location.origin);
    url.searchParams.append("name", channelName);
    const response = await fetch(url);
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
function createNewChannel(channelName) {
    const channel = document.createElement("li");
    const link = document.createElement("a");
    link.href = "";
    link.className = "ch-link";
    link.onclick = function() {    
        keepActive(this); 
        console.log(`clicked on channel ${channelName}`);
        getMessages(channelName)
        .then(messages => console.log(messages));
        return false; 
    }
    link.innerHTML = "\xa0 # \xa0" + channelName;
    channel.appendChild(link);
    document.querySelector(".channels").appendChild(channel);
}

function keepActive(a) {
    items = document.querySelectorAll('.ch-link.active');
    if (items.length) {
        items[0].className = 'ch-link';
    }
    a.className = 'ch-link active';
}


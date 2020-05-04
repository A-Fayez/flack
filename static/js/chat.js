const message_template = Handlebars.compile(document.querySelector("#message").innerHTML);

document.addEventListener('DOMContentLoaded', () => {
    const test = message_template({'source': "own", "sender": "fayez", "message": "hi"});
    console.log(test); 
    const displayName = document.querySelector("#name").innerHTML;
    localStorage.setItem('name', displayName);

    // used to execute displaying of messages box and new message are
    // only once
    // TODO: might get in your way of implementing remembering the channel
    var anyLinkClicked = false; 

    // list previously created channels 
    fetch("/channels")
    .then(response => response.json())
    .then((channelsJSON) => {
        channelsJSON['channels'].forEach((channelName) => {
            createNewChannelElement(channelName);
        });
    })

    // socket commincation and controlling of sending/receiving messages


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
                createNewChannelElement(channelName);
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

// Helper functions

// displays an alert message if user tried to create a channel a name 
// that conflicts with a created channel
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

// Creates a new list item representing the channel
// this function is used at the initial loading of the page to fetch 
// previously created channels and gets their messages sent in them if there are any.
// Note: new created channels will receive null on messages key
function createNewChannelElement(channelName) {
    const channel = document.createElement("li");
    const link = document.createElement("a");
    link.href = "";
    link.className = "ch-link";
    link.onclick = function() {   
        keepActive(this); 

        // show new message box 
        if (!window.anyLinkClicked) {
            anyLinkClicked = true;
            document.querySelectorAll(".input-message-area, .messages").forEach((element) => {
                element.style.display = "flex";
            });
         }
         
        console.log(`clicked on channel ${channelName}`);
        getMessages(channelName)
        .then((messages) => {
            // an assertion that we got the right messages from the server
            if (messages.channel !== channelName) {
                console.log("channel name bad request");
                throw new Error("Something is wrong");
            }

            // display messages in their handlebars template
            const message_wrapper = document.querySelector(".inline-container");
            messages["messages"].forEach((message) => {
                const message_source = message.user === document.querySelector("#name").innerHTML ? "own" : "other";
                const message_bubble = message_template({
                    "source": message_source, // TODO
                    "sender": message.user,
                    "timestamp": message["timestamp"], //TODO
                    "message": message["text"]
                });
                message_wrapper.innerHTML += message_bubble;
            });

        }); 
        return false; 
    }
    link.innerHTML = "\xa0 # \xa0" + channelName;
    channel.appendChild(link);
    document.querySelector(".channels").appendChild(channel);
}

function keepActive(a) {
    activeLinks = document.querySelectorAll('.ch-link.active');
    if (activeLinks.length) {
        activeLinks[0].className = 'ch-link';
    }
    a.className = 'ch-link active';
}

// returns a promise from sending a post request with desired api url 
// and post data
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


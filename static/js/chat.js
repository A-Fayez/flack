const message_template = Handlebars.compile(document.querySelector("#message").innerHTML);

var messages = {};
var current_channel = "";
var display_name = "";
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

document.addEventListener('DOMContentLoaded', () => {

    display_name = document.querySelector("#name").innerHTML;
    localStorage.setItem('name', display_name);

    // used to execute displaying of messages box and new message only once
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

    // load all messages to the global variable
    const request = new XMLHttpRequest();
    request.open('GET', '/messages');
    request.onload = () => {
        messages = JSON.parse(request.responseText);
    };
    request.send();


    // socket commincation and controlling of sending/receiving messages
    socket.on('connect', () => {
        document.querySelector("button.send").onclick = () => {
            const bubble = {
                "channel": current_channel,
                "user": display_name,
                "timestamp": get_timestamp(),
                "message": document.querySelector("#new-message-box").value
            };

            socket.emit('send message', bubble);
        }; 
    });

    // When a new message is received, add to the messages object
    socket.on('receive message', bubble => {
        const channel = bubble["channel"];
        messages[channel].push({
            user: bubble["user"],
            timestamp: bubble["timestamp"],
            message: bubble["message"]}
        );
        // now display the new message bubble
        const message_wrapper = document.querySelector(".inline-container");
        const message_source = bubble["user"] === document.querySelector("#name").innerHTML ? "own" : "other";
        const message_bubble = message_template({
            "source": message_source, 
            "sender": bubble["user"],
            "timestamp": bubble["timestamp"], 
            "message": bubble["message"]
        });
        message_wrapper.innerHTML += message_bubble;

        console.log(messages)
    });


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
                createNewChannelElement(channelName, true);
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
function createNewChannelElement(channelName, just_created = false) {
    const channel = document.createElement("li");
    const link = document.createElement("a");
    link.innerHTML = "\xa0 # \xa0" + channelName;
    link.href = "";
    link.className = "ch-link";
    link.onclick = function() {  
        
        current_channel = channelName;
        keepActive(this); 

        // show new message box 
        if (!window.anyLinkClicked) {
            anyLinkClicked = true;
            document.querySelectorAll(".input-message-area, .messages").forEach((element) => {
                element.style.display = "flex";
            });
         }
         // display messages in their handlebars template
         const message_wrapper = document.querySelector(".inline-container");
         message_wrapper.innerHTML = "";

         if (!messages[channelName]){
             return false;
         }
         
         messages[channelName].forEach((bubble) => {
             const message_source = bubble.user === document.querySelector("#name").innerHTML ? "own" : "other";
             const message_bubble = message_template({
                 "source": message_source, 
                 "sender": bubble.user,
                 "timestamp": bubble["timestamp"], 
                 "message": bubble["message"]
             });
             message_wrapper.innerHTML += message_bubble;
         });

        return false; 
    }
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

function get_timestamp() {
    const time = new Date();
    return time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
}


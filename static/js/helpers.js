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
    link.id = channelName;
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
         
         // display messages from the global object messages 
         messages[channelName].forEach((bubble) => {
             const message_source = bubble.user === document.querySelector("#name").innerHTML ? "own" : "other";
             const message_bubble = message_template({
                 "source": message_source, 
                 "sender": bubble.user,
                 "timestamp": bubble["timestamp"], 
                 "message": bubble["message"]
             });
             message_wrapper.innerHTML += message_bubble;

             // configure delete button
             document.querySelectorAll(".msg-bubble.own .delete").forEach(link => {
                 link.href = "";
                 link.onclick = function() {
                    if (confirm("Are you sure you want to delete your message?")) {
                        socket.emit("delete message", {"test": "test"});
                        console.log("clicked on msg");
                        this.parentNode.remove();
                    }
                     return false;
                 }
             })
             
         });

        document.querySelector("#new-message-box").placeholder = `Message # ${channelName}`;

        updateScroll();
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

function updateScroll(){
    const chat_box = document.querySelector("#chat-box");
    if (chat_box.scrollHeight - chat_box.clientHeight > 0) {
        chat_box.scrollTop = chat_box.scrollHeight;
    }
}

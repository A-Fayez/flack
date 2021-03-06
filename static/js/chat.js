const message_template = Handlebars.compile(
    document.querySelector("#messages-box").innerHTML
);

var messages = {};
var current_channel = "";
var display_name = "";
var channels = [];
var socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
);

document.addEventListener("DOMContentLoaded", () => {
    display_name = document.querySelector("#name").innerHTML;
    localStorage.setItem("name", display_name);

    document.querySelector("textarea").addEventListener("keydown", (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            document.querySelector("button.send").click();
        }
    });

    // used to make dispaying of necessary ui only once
    // doesn't have to execute code more than once when channels keeps clicked on
    var anyLinkClicked = false;

    // list previously created channels
    fetch("/channels")
        .then((response) => response.json())
        .then((channelsJSON) => {
            channelsJSON["channels"].forEach((channel_name) => {
                channels.push(channel_name);
                console.log(channel_name);
                createNewChannelElement(channel_name);
            });
        });

    // load all messages to the global variable
    const request = new XMLHttpRequest();
    request.open("GET", "/messages");
    request.send();
    request.onload = () => {
        messages = JSON.parse(request.responseText);
    };

    // socket commincation and controlling of sending/receiving messages

    socket.on("connect", () => {
        // sending a new message
        document.querySelector("button.send").onclick = () => {
            const textbox = document.querySelector("#new-message-box");

            // prevent empty messages
            if (textbox.value.trim() === "") {
                return false;
            }

            const bubble = {
                channel: current_channel,
                user: display_name,
                timestamp: get_timestamp(),
                message: textbox.value,
            };

            socket.emit("send message", bubble);

            textbox.value = "";
        };

        // creating new channel
        document.querySelector("#create").onclick = () => {
            const channel_name = document.querySelector("#new-channel-name").value;

            if (channels.includes(channel_name)) {
                duplicateChannelName();
                return false;
            }

            socket.emit("channel created", { name: channel_name });
            return
        };
    });

    // When a new message is received, add to the messages object
    socket.on("receive message", (bubble) => {
        const channel = bubble["channel"];
        messages[channel].push({
            user: bubble["user"],
            timestamp: bubble["timestamp"],
            message: bubble["message"],
            id: bubble["id"],
        });

        console.log(bubble);

        // now display the new message bubble
        if (bubble.channel === current_channel) {
            const message_wrapper = document.querySelector(".inline-container");
            const message_source =
                bubble["user"] === document.querySelector("#name").innerHTML
                    ? "own"
                    : "other";
            const message_bubble = message_template({
                source: message_source,
                sender: bubble["user"],
                timestamp: bubble["timestamp"],
                message: bubble["message"],
                id: bubble["id"],
            });

            message_wrapper.innerHTML += message_bubble;

            updateScroll();

            // configure delete message button
            const del_btn = message_wrapper.querySelector(
                `#${CSS.escape(bubble["id"])} .delete`
            );
            del_btn.href = "";
            del_btn.addEventListener("click", (e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to delete your message?")) {
                    socket.emit("delete message", bubble);
                }
                return false;
            });
        }
    });

    socket.on("channel validation", (channel) => {
        console.log(channel);
        if (channel.valid) {
            channels.push(channel.name);
            createNewChannelElement(channel.name, true);
            messages[channel.name] = [];
            popup.style.display = "none";
            console.log("channel created");
        }
    });

    socket.on("confirm delete", (bubble) => {
        console.log("received broadcast deletion");
        remove_message(bubble["channel"], bubble["id"]);
    });

    // control displaying of create-new-channel popup
    const popup = document.querySelector(".popup");
    document.querySelector("#new-channel-btn").onclick = () => {
        popup.style.display = "flex";
        document.querySelector(".popup input").value = "";
        document.querySelector(".popup input").focus();

        document.querySelector(".popup input").addEventListener("keydown", (e) => {
            if (e.keyCode === 13) {
                e.preventDefault();
                document.querySelector("#create").click();
                return;
            }
        });
    };
    document.querySelector("#cancel").onclick = () => {
        popup.style.display = "none";
    };
});


window.onload = function remember() {
    // remember the channel when the user leave the website and comes back
    setTimeout(() => {
        if (localStorage.getItem("last_channel")) {
            const channel_id = localStorage.getItem("last_channel");
            document.querySelector(`#${channel_id}`).click();
            console.log(`I remembered #${channel_id}`);
        }
    }, 100);
};

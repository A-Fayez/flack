import os

from flask import Flask,render_template, request, jsonify, redirect, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = ["John Doe", "Jane Doe", "Meligy", "Fayez"]
channels_list = ["general", "bots", "random"]
# K: <string(chName)>, V: stack of messages (list) each element in list is dict with K:user V: msg
messages_memory = {"general": [ { 
                                  "user": "John Doe",
                                  "timestamp": "11:10 AM",
                                  "message": "Hi jane"
                                }, {
                                    "user": "Jane Doe",
                                    "timestamp": "11:11 AM",
                                    "message": "Hi john"
                                }, {
                                     "user": "Fayez",
                                    "timestamp": "11:13 AM",
                                    "message": "Hi all"
                                }
                            ],
                    "random": [ { 
                                  "user": "John ",
                                  "timestamp": "2:10 AM",
                                  "message": "Hi jane"
                                }, {
                                    "user": "Jane ",
                                    "timestamp": "2:11 AM",
                                    "message": "Hey"
                                }, {
                                     "user": "Sabrina",
                                    "timestamp": "2:13 AM",
                                    "message": "sup"
                                }
                            ]
                } 


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["GET", "POST"])
def chat():

    if request.method == "GET":
        name = request.args.get("name")
        if name.lower() not in list(map(lambda x:x.lower(), users)):
            return render_template("index.html")

        return render_template("chat.html", display_name=name)

    # authenticate
    # we want no display name conflicts and at the same time we want to display
    # them as typed, hence using the map function 
    elif request.method == "POST":
        name = request.form.get("name")
        if name.lower() in list(map(lambda x:x.lower(), users)): # display name conflicts
            return render_template("index.html", auth="False")
        users.append(name)
        print(users)
        return render_template("chat.html", display_name=name)
    
    return 405


# TODO: make an empty list of bubbles to newly created messages
@app.route("/channels", methods=["GET", "POST"])
def channels():
    """An endpoint that returns a list of previously created channels
    in case of a GET request. And create a new channel in case of a
    POST request.
    """
    if request.method == "GET":
        return jsonify({"channels": channels_list})

    # Make sure of receiving a valid post json request
    elif request.method == "POST":
        print(channels_list)
        if len(request.json.keys()) != 1 or list(request.json.keys())[0] != "chName":
            print(list(request.json.keys())[0])
            return jsonify({"status": "400", "message": "Bad request"}), 400
        
        channel_name = request.json.get("chName")
        if channel_name in channels_list:
            return jsonify({"valid": False}), 409

        channels_list.append(channel_name)
        messages_memory[channel_name] = []

        return jsonify({"valid": True})
    
    return 405

@app.route("/messages", methods=["GET"])
def messages():
    """returns a json representation of previously sent messages in the channel name
    specified in the url query param.
    """

    return jsonify(messages_memory)


@socketio.on("send message")
def receive(bubble):

    messages_memory[bubble["channel"]].append({
        "user": bubble["user"],
        "timestamp": bubble["timestamp"],
        "message": bubble["message"]
    })

    # only store up to 100 messages
    if len(messages_memory[bubble["channel"]]) > 100:
        del messages_memory[bubble["channel"]][0]

    # import pprint
    # pprint.pprint(messages_memory)
    # pprint.pprint(bubble)

    emit("receive message", bubble, broadcast=True)


@socketio.on("channel created")
def channel(channel):
    print(channel)

    if channel["name"] in channels_list:
        emit("channel validation", {"valid": False})
    
    channels_list.append(channel["name"])
    messages_memory[channel["name"]] = []

    emit("channel validation", {"valid": True, "name": channel["name"]}, broadcast=True)



if __name__ == '__main__':
    socketio.run(app)
import os

from flask import Flask,render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = []
channels_list = ["general", "bots", "random"]
messages = {} # K: <string>, V: <dict, k:<string(user)>, v:<list of string messages>

@app.route("/")
def index():
    return render_template("display.html")

@app.route("/chat", methods=["GET", "POST"])
def chat():

    if request.method == "GET":
        name = request.args.get("name")
        return render_template("chat.html", display_name=name)

    # authenticate 
    elif request.method == "POST":
        name = request.form.get("name")
        if name.lower() in users: # display name conflicts
            return render_template("display.html", auth="False")
        users.append(name.lower())
        return render_template("chat.html", display_name=name)
    
    return 405


@app.route("/channels", methods=["GET", "POST"])
def channels():
    """An endpoint that returns a list of previously created channels
    in case of a GET request. And create a new channel in case of a
    POST request.
    """
    if request.method == "GET":
        return jsonify({"channels": channels_list})

    # Make sure of receiving a valid json request
    elif request.method == "POST":
        print(channels_list)
        if len(request.json.keys()) != 1 or list(request.json.keys())[0] != "chName":
            print(list(request.json.keys())[0])
            return jsonify({"status": "400", "message": "Bad request"}), 400
        
        channel_name = request.json.get("chName")
        if channel_name in channels_list:
            return jsonify({"valid": False}), 409

        channels_list.append(channel_name)
        return jsonify({"valid": True})
    
    return 405

@app.route("/messages", methods=["GET"])
def messages():
    channel_name = request.args.get("name")
    print(channel_name)
    if channel_name not in channels_list:
        return jsonify({"status": "400", "message": "Bad request"}), 400

    print(f"inside test view function with channel {channel_name}")
    print(request.args)
    return jsonify({
        "channel": channel_name,
        "message": f"{channel_name}'s message test'"
    })
    
if __name__ == '__main__':
    socketio.run(app)

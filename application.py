import os

from flask import Flask,render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = []
channels = []
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


# TODO: 
@app.route("/channels", methods=["GET", "POST"])
def channels():
    """An endpoint that returns a list of previously created channels
    in case of a GET request. And create a new channel in case of a
    POST request.
    """
    if request.method == "GET":
        return jsonify({
                    "channels": channels
                 })

    elif request.method == "POST":
        # TODO: get JSON data and append to channels list


if __name__ == '__main__':
    socketio.run(app)

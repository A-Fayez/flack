import os

from flask import Flask,render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = []

@app.route("/")
def index():
    return render_template("display.html")

@app.route("/chat", methods=["GET"])
def chat():
    name = request.args.get("name")
    return render_template("chat.html", display_name=name)


# TODO: check if user already exists
@app.route("/join", methods=["POST"])
def join():

    name = request.form.get("name")
    if name not in users:
        users.append(name)
    print(users) # for debugging
    return render_template("chat.html", display_name=name)

# TODO: 
@app.route("/popup", methods=["GET"])
def popup():
    return "TEST POPUP"

if __name__ == '__main__':
    socketio.run(app)

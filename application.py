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

@app.route("/content", methods=["GET"])
def content():

    name = request.args.get('name')

    if name == 'null' or name is None:
        with app.open_resource('templates/display.html') as f:
            return f.read()
  
    # TODO :check if user isn't registered, if already registered
    # roll back to last if
    with app.open_resource('templates/chat.html') as f:
        html_body = f.read()

    return html_body

@app.route("/join", methods=["POST"])
def join():

    name = request.form.get("name")
    if name not in users:
        users.append(name)
    print(users)
    return render_template("chat.html")


if __name__ == '__main__':
    socketio.run(app)

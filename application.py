import os

from flask import Flask,render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

@app.route("/")
def index():
    return render_template("layout.html")

@app.route("/content", methods=["GET"])
def content():
    name = request.args.get('name')
    if name == 'null':
        with app.open_resource('templates/display.html') as f:
            return f.read()
  
    # TODO: check if name is reguistered in server-side memory
    with app.open_resource('templates/chat.html') as f:
        html_body = f.read()
    return html_body


if __name__ == '__main__':
    socketio.run(app)

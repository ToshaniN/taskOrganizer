from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

CORS(app, supports_credentials = True)

from eventListeners import socketEvents
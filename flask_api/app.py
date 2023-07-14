from flask import Flask
from flask_restful import Api
from flask_cors import CORS, cross_origin
# from flask_socketio import SocketIO

app = Flask(__name__)
api = Api(app)
# socketio = SocketIO(app, cors_allowed_origins="*")

CORS(app, supports_credentials = True)


import routes
import database
# import socket_routes
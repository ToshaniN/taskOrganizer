from flask import Flask
from flask_restful import Api
from flask_cors import CORS, cross_origin

app = Flask(__name__)
api = Api(app)

CORS(app, supports_credentials = True)

import routes
import database
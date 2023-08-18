from flask import Flask
from flask_restful import Api
from flask_cors import CORS

app = Flask(__name__)
api = Api(app)

CORS(app, supports_credentials = True)


from routes import routes
from orm import database
from orm.database import session

@app.teardown_appcontext
def shutdown_session(exception=None):
    print("removing session")
    session.remove()
    
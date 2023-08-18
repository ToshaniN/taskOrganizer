from sqlalchemy.orm.session import sessionmaker
from sqlalchemy import create_engine
from config import config
from sqlalchemy.orm import scoped_session 

connection_string = "mysql+mysqlconnector://" + config.connection['username'] + ':' + config.connection['password'] + "@database:5002/todolist"  
# To run the app without docker, replace "@database:5002/todolist" above with: "@localhost:3306/todolist"


class ConnectDB:
    def createEngine():
        return create_engine(connection_string)
    
    def makeSession(engine):
        session_factory = sessionmaker(bind=engine)
        Session = scoped_session(session_factory)
        print("session made")
        return Session
from sqlalchemy.orm.session import sessionmaker
from sqlalchemy import create_engine
import config
from sqlalchemy.orm import scoped_session 

connection_string = "mysql+mysqlconnector://" + config.connection['username'] + ':' + config.connection['password'] + "@localhost:3306/todolist"


class ConnectDB:
    def createEngine():
        return create_engine(connection_string)
    
    def makeSession(engine):
        session_factory = sessionmaker(bind=engine)
        Session = scoped_session(session_factory)
        return Session
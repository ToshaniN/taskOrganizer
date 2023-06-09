from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import config

connection_string = "mysql+mysqlconnector://" + config.connection['username'] + ':' + config.connection['password'] + "@localhost:3306/todolist"


class ConnectDB:
    def createEngine():
        return create_engine(connection_string)
    
    def makeSession(engine):
        Session = sessionmaker(bind=engine)
        return Session()
from sqlalchemy import Column, Integer
from sqlalchemy.ext.automap import automap_base
from connect_db import ConnectDB

Base = automap_base()

class agendas(Base):
    __tablename__ = 'agendas'
    __table_args__ = {'extend_existing': 'True'}
    id = Column('id', Integer, primary_key=True)

class tasks(Base):
    __tablename__ = 'tasks'
    __table_args__ = {'extend_existing': 'True'}
    id = Column('id', Integer, primary_key=True)

class comments(Base):
    __tablename__ = 'comments'
    __table_args__ = {'extend_existing': 'True'}
    id = Column('id', Integer, primary_key=True)


engine = ConnectDB.createEngine()
session = ConnectDB.makeSession(engine)
# session = Session()

Base.prepare(autoload_with=engine)


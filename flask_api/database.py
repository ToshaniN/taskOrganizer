from sqlalchemy import Column, Integer, String, TIMESTAMP, func, Date, ForeignKey
from sqlalchemy.ext.automap import automap_base
from connect_db import ConnectDB

Base = automap_base()

class agendas(Base):
    __tablename__ = 'agendas'
    __table_args__ = {'extend_existing': 'True'}
    id = Column('id', Integer, primary_key=True)
    # name = Column('name', String(100))
    # status = Column('status', String(45))

class tasks(Base):
    __tablename__ = 'tasks'
    __table_args__ = {'extend_existing': 'True'}
    id = Column('id', Integer, primary_key=True)
    # task2agenda = Column(Integer, ForeignKey('agendas.id'))
    # title = Column('title', String(200))
    # due_date = Column('due_date', Date)
    # priority = Column('priority', Integer)
    # status = Column('status', String(45))
    # description = Column('description', String(500))

class comments(Base):
    __tablename__ = 'comments'
    __table_args__ = {'extend_existing': 'True'}
    id = Column('id', Integer, primary_key=True)
    # comment2task = Column(Integer, ForeignKey('tasks.id'))
    # comment_text = Column('comment_text', String(500))


engine = ConnectDB.createEngine()
session = ConnectDB.makeSession(engine)

Base.prepare(autoload_with=engine)


from flask_socketio import emit
from flask import request
from db_interactions import DBInteractions
import time

class SocketHandler:
    # Acknowledgement..................................................
    def ack(message):
        print(message)

    # Built-in.........................................................
    def connected():
        print('Connected to client')

    def disconnected():
        print('Disconnected from client')

    def error_handler(e):
        print("error message:" + request.event["message"])
        print("event arguments for error:" + request.event["args"])
    # .................................................................

    responseEvtName = {
        'newTask': 'taskAdded',
        'updateTask': 'taskUpdated',
        'deleteTask': 'taskDeleted',
        'newAgenda': 'agendaAdded',
        'updateAgenda': 'agendaUpdated',
        'deleteAgenda': 'agendaDeleted',
        'newComment': 'commentAdded',
        'updateComment': 'commentUpdated',
        'deleteComment': 'commentDeleted'
    }
    
    def dataIn(fromClient):
        eventName = fromClient.pop('type')
        # if (eventName == 'updateTask'):
        #     print("Sleeping")
        #     time.sleep(3)
        #     print("Awake")
        response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
        if (eventName != 'getHierarchy' and eventName != 'getComments'):
            response['type'] = SocketHandler.responseEvtName[eventName]
            emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        return response
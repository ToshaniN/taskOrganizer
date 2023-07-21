from flask_socketio import emit
from flask import request
from db_interactions import DBInteractions
from event_config import responseEventName

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
    
    def dataIn(fromClient):
        eventName = fromClient.pop('type')
        response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
        if (eventName != 'getHierarchy' and eventName != 'getComments'):
            response['type'] = responseEventName[eventName]
            emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        return response
from flask_socketio import emit
from flask import request
from middleware.response_parser import ResponseParser
from socket_server_config.event_config import responseEventName

class SocketHandler:
    # Acknowledgement..................................................
    def ack(self, message):
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
    
    # Received from client.............................................
    def dataIn(self, fromClient):
        eventName = fromClient.pop('type')
        response = ResponseParser().getResponse(fromClient["payload"], fromClient["endpoint"])
        # if (eventName == 'newTask'):
        #     SocketHandler.newTaskDataIn(fromClient)
        # else:
        if (eventName != 'getHierarchy' and eventName != 'getComments'):
            response['type'] = responseEventName[eventName]
            emit('dataOut', response, callback=self.ack, broadcast=True, include_self=False)
        return response
    

    # def newTaskDataIn(fromClient):
    #     response = ResponseParser().getResponse(fromClient["payload"], fromClient["endpoint"])
    #     response['type'] = 'taskAdded'
    #     emit('dataOut', response, callback=SocketHandler.ack, broadcast=True)
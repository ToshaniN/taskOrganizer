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
        response['type'] = SocketHandler.responseEvtName[eventName]
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        return response

    # Task CRUD........................................................
    # def createTask(fromClient):
    #     print("Made it to createTask")
    #     response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
    #     response['type'] = 'taskAdded'
    #     emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
    #     return response
 

    # def updateTask(fromClient):
    #     print("Made it to update task")
    #     response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
    #     response['type'] = 'taskUpdated'
    #     print("Task updated")
    #     emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
    #     return response


    # def deleteTask(fromClient):
    #     print("Made it to delete task")
    #     response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
    #     response['type'] = 'taskDeleted'
    #     print("Task deleted")
    #     emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
    #     return response

    # # Agenda CRUD......................................................
    # def createAgenda(fromClient):
    #     print("Made it to create agenda")
    #     response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
    #     response['type'] = 'agendaAdded'
    #     print("New agenda added")
    #     emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
    #     return response
    
    # def updateAgenda(fromClient):
    #     print("Made it to update agenda")
    #     response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
    #     response['type'] = 'agendaUpdated'
    #     print("Agenda updated")
    #     emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
    #     return response
    
    # def deleteAgenda(fromClient):
    #     print("Made it to delete agenda")
    #     response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
    #     response['type'] = 'agendaDeleted'
    #     print("Agenda deleted")
    #     emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
    #     return response
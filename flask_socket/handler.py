from flask_socketio import emit
from flask import request
# from socket_config import apiURL
from db_interactions import DBInteractions
# import httpx

# import sys
# sys.path.insert(0, 'C:/Users/tosha/Documents/Github repos/taskOrganizer/flask_api')
# from task_handler import TaskHandler

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

    # Task CRUD........................................................
    def createTask(fromClient):
        print("Made it to createTask")
        # url = apiURL + fromClient["endpoint"]
        # response = httpx.post(url, json=fromClient["payload"])
        # print("back here in 5001 after api call - task create")
        # resJson = response.json()
        # resJson['type'] = 'taskAdded'
        response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
        response['type'] = 'taskAdded'
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        return response
 

    def updateTask(fromClient):
        print("Made it to update task")
        # url = apiURL + fromClient["endpoint"]
        # response = httpx.post(url, json=fromClient["payload"])
        # print("back here in 5001 after api call - task update")
        # resJson = response.json()
        # resJson['type'] = 'taskUpdated'
        response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
        response['type'] = 'taskUpdated'
        print("Task updated")
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        return response


    def deleteTask(fromClient):
        print("Made it to delete task")
        # url = apiURL + fromClient["endpoint"]
        # response = httpx.post(url, json=fromClient["payload"])
        # print("back here in 5001 after api call - task deleted")
        # resJson = response.json()
        # resJson['type'] = 'taskDeleted'
        response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
        response['type'] = 'taskDeleted'
        print("Task deleted")
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        return response

    # Agenda CRUD......................................................
    def createAgenda(fromClient):
        print("Made it to create agenda")
        # url = apiURL + fromClient["endpoint"]
        # response = httpx.post(url, json=fromClient["payload"])
        # print("back here in 5001 after api call - agenda added")
        # resJson = response.json()
        # resJson['type'] = 'agendaAdded'
        response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
        response['type'] = 'agendaAdded'
        print("New agenda added")
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        return response
    
    def updateAgenda(fromClient):
        print("Made it to update agenda")
        # url = apiURL + fromClient["endpoint"]
        # response = httpx.post(url, json=fromClient["payload"])
        # print("back here in 5001 after api call - agenda updated")
        # resJson = response.json()
        # resJson['type'] = 'agendaUpdated'
        response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
        response['type'] = 'agendaUpdated'
        print("Agenda updated")
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        return response
    
    def deleteAgenda(fromClient):
        print("Made it to delete agenda")
        # url = apiURL + fromClient["endpoint"]
        # response = httpx.post(url, json=fromClient["payload"])
        # print("back here in 5001 after api call - agenda deleted")
        # resJson = response.json()
        # resJson['type'] = 'agendaDeleted'
        response = DBInteractions.getResponse(fromClient["payload"], fromClient["endpoint"])
        response['type'] = 'agendaDeleted'
        print("Agenda deleted")
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        return response
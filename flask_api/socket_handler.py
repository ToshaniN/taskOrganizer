from flask_socketio import emit
from flask import request
from task_handler import TaskHandler
import requests
import httpx

class SocketHandler:
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
    # def createTask(payload):
    #     print("Made it to createTask")
    #     url = 'http://localhost:5000/task/create'
    #     # response = requests.post(url, json=payload)
    #     # response = httpx.get('https://api.sampleapis.com/avatar/info')
    #     response = httpx.post(url, json=payload)
    #     print("back here")
    #     print(response.status_code)
    #     print(response)
    #     print(response.json())
    #     resJson = response.json()
    #     resJson['type'] = 'taskAdded'
    #     emit('dataOut', resJson, broadcast=True)

    def ack(message):
        print(message)

    def createTask(payload):
        print("Made it to createTask")
        response = TaskHandler.createNewTask(payload)
        response['type'] = 'taskAdded' 
        print("New task added")
        # emit('dataOut', response, callback=SocketHandler.ack)
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)  # , include_self=False
        # return {'type': response['type'], 'id': response['datarec']['id']}
        return response

    def updateTask(payload):
        print("Made it to update task")
        response = TaskHandler.updateTask(payload)
        response['type'] = 'taskUpdated'
        print("Task updated")
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        # return {'type': response['type'], 'id': response['datarec']['id']}
        return response

    def deleteTask(payload):
        print("Made it to delete task")
        response = TaskHandler.deleteTask(payload)
        response['type'] = 'taskDeleted'
        print("Task deleted")
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        # return {'type': response['type'], 'id': response['datarec']['id']}
        return response

    # Agenda CRUD......................................................
    def createAgenda(datarec):
        print("New agenda added")
        emit('agendaAdded', {'datarec': datarec}, broadcast=True)
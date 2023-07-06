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
    def createTask(payload):
        print("Made it to createTask")
        url = 'http://127.0.0.1:5000/task/create'
        # response = requests.post(url, json=payload)  #url, json=payload
        response = httpx.post(url, json=payload)
        print("back here")
        print(response.status_code)
        print(response)
        print(response.json())
        resJson = response.json()
        resJson['type'] = 'taskAdded'
        emit('dataOut', response.json(), broadcast=True)
        # response = TaskHandler.createNewTask(payload)
        # response['type'] = 'taskAdded' 
        # print("New task added")
        # emit('dataOut', response, broadcast=True)

    def updateTask(payload):
        print("Made it to update task")
        response = TaskHandler.updateTask(payload)
        response['type'] = 'taskUpdated'
        print("Task updated")
        emit('dataOut', response, broadcast=True)

    def deleteTask(payload):
        print("Made it to delete task")
        response = TaskHandler.deleteTask(payload)
        response['type'] = 'taskDeleted'
        print("Task deleted")
        emit('dataOut', response, broadcast=True)

    # Agenda CRUD......................................................
    def createAgenda(datarec):
        print("New agenda added")
        emit('agendaAdded', {'datarec': datarec}, broadcast=True)
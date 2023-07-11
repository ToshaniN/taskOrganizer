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
    # def createTask(fromClient):
    #     print("Made it to createTask")
    #     url = 'http://localhost:5000/task/create'
    #     # url = 'http://127.0.0.1:5001/WantLongURL'
    #     # response = httpx.get('https://api.sampleapis.com/avatar/info')
    #     # payload = {"shortURL" : "https://urlshortener.com/Token70"}
    #     print(fromClient["payload"])
    #     response = httpx.Request("POST", url, params=fromClient["payload"])
    #     print("back here")
    #     print(response.status_code)
    #     print(response)
    #     response['type'] = 'taskUpdated'
    #     print(response.json())
    #     resJson = response.json()
    #     resJson['type'] = 'taskAdded'
    #     emit('dataOut', resJson, callback=SocketHandler.ack, broadcast=True, include_self=False)

    def ack(message):
        print(message)

    def createTask(fromClient):
        print("Made it to createTask")
        response = TaskHandler.createNewTask(fromClient["payload"])
        response['type'] = 'taskAdded' 
        print("New task added")
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        return response

    def updateTask(fromClient):
        print("Made it to update task")
        response = TaskHandler.updateTask(fromClient["payload"])
        response['type'] = 'taskUpdated'
        print("Task updated")
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        return response

    def deleteTask(fromClient):
        print("Made it to delete task")
        response = TaskHandler.deleteTask(fromClient["payload"])
        response['type'] = 'taskDeleted'
        print("Task deleted")
        emit('dataOut', response, callback=SocketHandler.ack, broadcast=True, include_self=False)
        return response

    # Agenda CRUD......................................................
    def createAgenda(datarec):
        print("New agenda added")
        emit('agendaAdded', {'datarec': datarec}, broadcast=True)
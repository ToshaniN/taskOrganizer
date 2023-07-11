from socket_config import apiURL, useFlaskApi
import httpx
import sys
sys.path.insert(0, 'C:/Users/tosha/Documents/Github repos/taskOrganizer/flask_api')
from task_handler import TaskHandler
from agenda_handler import AgendaHandler

class DBInteractions:
    def getResponse(payload, endpoint):
        if (useFlaskApi):
            return DBInteractions.makeApiRequest(payload, endpoint)
        else:
            return DBInteractions.callHandlerFunction(payload, endpoint)

    def makeApiRequest(payload, endpoint):
        url = apiURL + endpoint
        response = httpx.post(url, json=payload)
        return response.json()
    
    def callHandlerFunction(payload, endpoint):
        if (endpoint == 'task/create'):
            response = TaskHandler.createNewTask(payload)
        elif (endpoint == 'task/update'):
            response = TaskHandler.updateTask(payload)
        elif (endpoint == 'task/delete'):
            response = TaskHandler.deleteTask(payload)
        elif (endpoint == 'agenda/create'):
            response = AgendaHandler.createNewAgenda(payload)
        elif (endpoint == 'agenda/update'):
            response = AgendaHandler.updateAgenda(payload)
        elif (endpoint == 'agenda/delete'):
            response = AgendaHandler.deleteAgenda(payload)
        return response
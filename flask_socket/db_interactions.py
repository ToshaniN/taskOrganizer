from socket_config import apiURL, useFlaskApi
import httpx
import sys
sys.path.insert(0, 'C:/Users/tosha/Documents/Github repos/taskOrganizer/flask_api')
from task_handler import TaskHandler
from agenda_handler import AgendaHandler
from comment_handler import CommentHandler
from agenda_task_handler import AgendaTaskHandler

class DBInteractions:
    def getResponse(payload, endpoint):
        if (useFlaskApi):
            return DBInteractions.makeApiRequest(payload, endpoint)
        else:
            return DBInteractions.callHandlerFunction[endpoint](payload)

    def makeApiRequest(payload, endpoint):
        url = apiURL + endpoint
        response = httpx.post(url, json=payload)
        return response.json()
    
    callHandlerFunction = {
        'task/create': (lambda payload: TaskHandler.createNewTask(payload)),
        'task/update': (lambda payload: TaskHandler.updateTask(payload)),
        'task/delete': (lambda payload: TaskHandler.deleteTask(payload)),
        'agenda/create': (lambda payload: AgendaHandler.createNewAgenda(payload)),
        'agenda/update': (lambda payload: AgendaHandler.updateAgenda(payload)),
        'agenda/delete': (lambda payload: AgendaHandler.deleteAgenda(payload)),
        'comment/add': (lambda payload: CommentHandler.createNewComment(payload)),
        'comment/update': (lambda payload: CommentHandler.updateComment(payload)),
        'comment/remove': (lambda payload: CommentHandler.deleteComment(payload)),
        'comment/get_all': (lambda payload: CommentHandler.getComments(payload)),
        'get_agenda_task_hierarchy': (lambda payload: AgendaTaskHandler.createHierarchy())
    }
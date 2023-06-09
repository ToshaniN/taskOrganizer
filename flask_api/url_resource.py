from handler import Handler
from agenda_handler import AgendaHandler
from task_handler import TaskHandler
from comment_handler import CommentHandler

from flask_restful import Resource
from flask import request, make_response
from flask_cors import cross_origin


# GENERAL REQUESTS.....................................................
# '/'
# class Home(Resource):
#     def post(self):
#         return make_response(Handler.home()) 

# '/get_agenda_task_hierarchy'
class GetHierarchy(Resource):
    def post(self):
        return 'originalDisplay'
#......................................................................


# AGENDA REQUESTS......................................................
# '/agenda/create'    
class AgendaCreate(Resource):
    def post(self):
        receivedInfo = request.get_json()
        return AgendaHandler.createNewAgenda(receivedInfo)
    
# '/agenda/update'
class AgendaUpdate(Resource):
    def post(self):
        receivedInfo = request.get_json()
        return AgendaHandler.updateAgenda(receivedInfo)
    
# '/agenda/delete'
class AgendaDelete(Resource):
    def post(self):
        receivedInfo = request.get_json()
        return AgendaHandler.deleteAgenda(receivedInfo)
#......................................................................


# TASK REQUESTS........................................................
# '/task/create'
class TaskCreate(Resource):
    def post(self):
        receivedInfo = request.get_json()                        
        return TaskHandler.createNewTask(receivedInfo)
    
# '/task/update'
class TaskUpdate(Resource):
    def post(self):
        receivedInfo = request.get_json()
        return TaskHandler.updateTask(receivedInfo)
    
# '/task/delete'
class TaskDelete(Resource):
    def post(self):
        receivedInfo = request.get_json()
        return TaskHandler.deleteTask(receivedInfo)
#......................................................................


# COMMENT REQUESTS.....................................................   
# '/comment/add'
class CommentAdd(Resource):
    def post(self):
        receivedInfo = request.get_json()
        return CommentHandler.createNewComment(receivedInfo)
    
# '/comment/update'
class CommentUpdate(Resource):
    def post(self):
        receivedInfo = request.get_json()
        return CommentHandler.updateComment(receivedInfo)
    
# '/comment/remove'
class CommentRemove(Resource):
    def post(self):
        receivedinfo = request.get_json()
        return CommentHandler.deleteComment(receivedinfo)

# '/comment/get_all'
class CommentGetAll(Resource):
    def post(self):
        return 'gotComments'
#......................................................................
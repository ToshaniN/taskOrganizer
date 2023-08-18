import sys
# sys.path.insert(0, 'C:/Users/tosha/Documents/Github repos/taskOrganizer/backend/flask_api')
sys.path.insert(0, '/flask_api')  # Use this path when running app with docker. Use above path structure when running normally 
from handlers.task_handler import TaskHandler 
from handlers.agenda_handler import AgendaHandler
from handlers.comment_handler import CommentHandler
from handlers.agenda_task_handler import AgendaTaskHandler

class ServiceHandler:
    # This maps the endpoints to the CRUD function that needs to be called from flask_api 
    socketEventOperations = {
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
from app import api
from resource.url_resource import *

class Routes:
    # Agenda CRUD endpoints
    api.add_resource(AgendaCreate, '/agenda/create')
    api.add_resource(AgendaUpdate, '/agenda/update')
    api.add_resource(AgendaDelete, '/agenda/delete')

    # Get Hierarchy endpoint
    api.add_resource(GetHierarchy, '/get_agenda_task_hierarchy')

    # Task CRUD endpoints
    api.add_resource(TaskCreate, '/task/create')
    api.add_resource(TaskUpdate, '/task/update')
    api.add_resource(TaskDelete, '/task/delete')

    # Comment CRUD endpoints
    api.add_resource(CommentAdd, '/comment/add')
    api.add_resource(CommentUpdate, '/comment/update')
    api.add_resource(CommentRemove, '/comment/remove')
    api.add_resource(CommentGetAll, '/comment/get_all')



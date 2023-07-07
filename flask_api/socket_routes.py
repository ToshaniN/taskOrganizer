from app import socketio
from socket_handler import SocketHandler
from socket_redirect import SocketEvtRedirect

class SocketRoutes:
    #Built-in events
    socketio.on_event('connect', SocketHandler.connected)
    socketio.on_event('disconnect', SocketHandler.disconnected)
    socketio.on_error(SocketHandler.error_handler)
    socketio.on_event('dataIn', SocketEvtRedirect.redirect)

    #Task CRUD
    # socketio.on_event('newTask', SocketHandler.createTask)
    # socketio.on_event('updateTask', SocketHandler.updateTask)
    # socketio.on_event('deleteTask', SocketHandler.deleteTask)

    #Agenda CRUD
    # socketio.on_event('newAgenda', SocketHandler.createAgenda)

    

from socket_handler import SocketHandler

class SocketEvtRedirect:
    def redirect(payload):
        eventName = payload.pop('type')
        if (eventName == 'newTask') :
            SocketHandler.createTask(payload)
        elif (eventName == 'updateTask'):
            SocketHandler.updateTask(payload)
        elif (eventName == 'deleteTask'):
            SocketHandler.deleteTask(payload)
        

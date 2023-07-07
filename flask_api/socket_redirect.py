from socket_handler import SocketHandler

class SocketEvtRedirect:
    def redirect(payload):
        eventName = payload.pop('type')
        if (eventName == 'newTask') :
            return SocketHandler.createTask(payload)
        elif (eventName == 'updateTask'):
            return SocketHandler.updateTask(payload)
        elif (eventName == 'deleteTask'):
            return SocketHandler.deleteTask(payload)
        elif (eventName == 'newAgenda'):
            SocketHandler.createAgenda(payload)
        

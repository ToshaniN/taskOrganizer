from socket_handler import SocketHandler

class SocketEvtRedirect:
    def redirect(fromClient):
        eventName = fromClient.pop('type')
        if (eventName == 'newTask') :
            return SocketHandler.createTask(fromClient)
        elif (eventName == 'updateTask'):
            return SocketHandler.updateTask(fromClient)
        elif (eventName == 'deleteTask'):
            return SocketHandler.deleteTask(fromClient)
        elif (eventName == 'newAgenda'):
            SocketHandler.createAgenda(fromClient)
        

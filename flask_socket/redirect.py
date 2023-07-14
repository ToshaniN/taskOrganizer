# from handler import SocketHandler

# class SocketEvtRedirect:
#     def redirect(fromClient):
#         eventName = fromClient.pop('type')
#         if (eventName == 'newTask') :
#             return SocketHandler.createTask(fromClient)
#         elif (eventName == 'updateTask'):
#             return SocketHandler.updateTask(fromClient)
#         elif (eventName == 'deleteTask'):
#             return SocketHandler.deleteTask(fromClient)
#         elif (eventName == 'newAgenda'):
#             return SocketHandler.createAgenda(fromClient)
#         elif (eventName == 'updateAgenda'):
#             return SocketHandler.updateAgenda(fromClient)
#         elif (eventName == 'deleteAgenda'):
#             return SocketHandler.deleteAgenda(fromClient)

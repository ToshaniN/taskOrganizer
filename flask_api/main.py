from app import app, socketio
# from flask_socketio import emit
# from flask import request

# @socketio.on('connect')
# def connected():
#     print('Connected to client')

# @socketio.on('disconnect')
# def disconnected():
#     print('Disconnected from client')

# @socketio.on_error()
# def error_handler(e):
#     print("error message:" + request.event["message"])
#     print("event arguments for error:" + request.event["args"])

# #....................................................
# @socketio.on('newTask')
# def createTask(datarec):
#     print("New task added")
#     emit('taskAdded', {'datarec': datarec}, broadcast=True)

# @socketio.on('newAgenda')
# def createAgenda(datarec):
#     print("Agenda added")
#     emit('agendaAdded', {'datarec': datarec}, broadcast=True)
# #...................................................... 

if __name__ == "__main__":
    socketio.run(app, debug=True)

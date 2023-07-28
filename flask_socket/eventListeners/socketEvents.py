from app import socketio
from handler.socket_event_handler import SocketHandler

class SocketEvents:
    socketio.on_event('connect', SocketHandler.connected)
    socketio.on_event('disconnect', SocketHandler.disconnected)
    socketio.on_error(SocketHandler.error_handler)
    socketio.on_event('dataIn', SocketHandler.dataIn)
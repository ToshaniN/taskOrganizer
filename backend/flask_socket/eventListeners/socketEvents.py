from app import socketio
from handler.socket_event_handler import SocketHandler

class SocketEvents:
    # Events that the backend socket is listening for
    socketio.on_event('connect', SocketHandler.connected)
    socketio.on_event('disconnect', SocketHandler.disconnected)
    socketio.on_error(SocketHandler.error_handler)
    socketio.on_event('dataIn', SocketHandler().dataIn)
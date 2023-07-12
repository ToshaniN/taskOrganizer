from app import socketio
from handler import SocketHandler
# from redirect import SocketEvtRedirect

class SocketRoutes:
    socketio.on_event('connect', SocketHandler.connected)
    socketio.on_event('disconnect', SocketHandler.disconnected)
    socketio.on_error(SocketHandler.error_handler)
    socketio.on_event('dataIn', SocketHandler.dataIn)
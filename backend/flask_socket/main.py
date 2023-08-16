from app import app, socketio

if __name__ == "__main__":
    print("socket starting")
    socketio.run(app, debug=True, host='socket_server', port=5001)
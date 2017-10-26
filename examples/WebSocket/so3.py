import socketio
import eventlet
from flask import Flask
from flask_socketio import emit

sio = socketio.Server()
app = Flask(__name__)

@sio.on('connect')
def test_connect(arg1, arg2):
    print('Client connected')
    sio.emit('message', {'data': 'Connected'})

@sio.on('randomEvent')
def testemit(arg1, arg2):
    sio.emit('responseevent', {'hi':'manju'})

@sio.on('disconnect')
def test_disconnect(arg):
    print('Client disconnected')



if __name__ == '__main__':
    app = socketio.Middleware(sio, app)
    #socketio.run(app, host="0.0.0.0", debug=True)
'''
if name == 'main':
    # wrap Flask application with engineio's middleware
    app = socketio.Middleware(sio, app)
'''

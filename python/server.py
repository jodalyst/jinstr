from flask import Flask, render_template, session, request, make_response, json, jsonify, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room,close_room, rooms, disconnect
import glob
import os
from threading import Thread, Lock
import serial
import struct

# Set up logging
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

async_mode = None
if async_mode is None:
    try:
        import eventlet
        async_mode = 'eventlet'
    except ImportError:
        pass

    if async_mode is None:
        try:
            from gevent import monkey
            async_mode = 'gevent'
        except ImportError:
            pass

    if async_mode is None:
        async_mode = 'threading'

    print('async_mode is ' + async_mode)

# monkey patching is necessary because this application uses a background
# thread
if async_mode == 'eventlet':
    import eventlet
    eventlet.monkey_patch()
elif async_mode == 'gevent':
    from gevent import monkey
    monkey.patch_all()

# Start up Flask server:
app = Flask(__name__, template_folder = './',static_url_path='/static')
app.config['SECRET_KEY'] = 'secret!' #shhh don't tell anyone. Is a secret
socketio = SocketIO(app, async_mode = async_mode)
thread = None

# Startup has occured
@app.route('/')
def index():
    global thread
    global data
    print ("A user connected")
    if thread is None:
        thread = Thread(target=dataThread)
        thread.daemon = True
        thread.start()
    return render_template('pages/main.html')

# Return the configuration
@app.route('/config', methods=['GET', 'POST'])
def config():
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "static/json", "config.json")
    data = json.load(open(json_url))
    return jsonify(data)

# Reporting changes that occur within modules throughout the program.
@socketio.on('reporting')
def action(content):
    unique = content['unique']
    data = content['data']
    # socketio.emit("{} changed to {}!".format(unique,data))
    print("{} changed to {}!".format(unique,data))

if __name__ == '__main__':
    socketio.run(app, port=3000, debug=True)





















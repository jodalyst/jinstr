from flask import Flask, render_template, session, request, make_response, json, jsonify, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room,close_room, rooms, disconnect
import glob
import os
from random import randint
from threading import Thread, Lock
import serial
import struct

# Set up logging
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# async_mode = 'gevent'
# async_mode = 'eventlet'
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

# Temporary main thread        
def dataThread():
    print("hey")

# Startup has occured
@app.route('/')
def index():
    global thread
    global data
    print ("A user connected")
    if thread is None:
        thread = Thread(target=dataThread)
        dataThread()
        thread.daemon = True
        thread.start()
    #return render_template('/pages/main.html')
    return "{}".format(identifiers)

# Return the configuration
@app.route('/config', methods=['GET', 'POST'])
def config():
    if request.method == 'GET':
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url = os.path.join(SITE_ROOT, "../configuration", "config.json")
        checkJson(json_url)
        config = json.load(open(json_url))
        print(jsonify(config).get_data())
        print(identifiers)
        return jsonify(config)
    elif request.method == 'POST':
        print("can't really post anything yet, sorry...")
    else:
        print("Check your request method.")

@app.route('/hello', methods=['GET'])
def sayHello():
    global identifiers
    if request.method == 'GET':
        print(identifiers)

# Check and update identifiers in the json. plus other things
def checkJson(json_url):
    # Make global dictionary of ID's
    global identifiers
    identifiers = {}

    # Open Json
    with open(json_url, "r") as jsonFile:
        config = json.load(jsonFile)
    print("configuration file")
    print(config)
    # Function to generate new unique identifier
    def newUnique(n):
        range_start = 10**(n-1)
        range_end = (10**n)-1
        return randint(range_start, range_end)

    # List to store existing unique values
    uniques = []
    # Open up modules portion of config.json
    modules = config[1]['modules']
    for module in modules:
        print("scanning module: {}".format(module)) 
        for instance in module:
            print("scanning module instance: {}".format(instance))
            for item in module[instance]:
                print("scanning item: {}".format(item))
                # Check if module already has unique identifer
                if 'unique' in item:
                    # Appends existing identifier to uniques
                    uniques.append(item['unique'])
                else:
                    # Generates new unique identifier
                    unique = newUnique(3)
                    # Checks if identifier hasn't already been used
                    if unique not in uniques:
                        # Assings identifier for that module
                        item['unique'] = unique
                identifiers[item['name']] = item['unique']

    # Write modified json file
    with open(json_url, "w") as jsonFile:
        # Complicated dump so that everytime we modify the json it isn't minified
        json.dump(config, jsonFile, sort_keys=True,indent=2,separators=(',',': '))

# Reporting changes that occur within modules throughout the program.
@socketio.on('reporting')
def action(content):
    unique = content['unique']
    data = content['data']
    # socketio.emit("{} changed to {}!".format(unique,data))
    print("{} changed to {}!".format(unique,data))

if __name__ == '__main__' or __name__ == 'server':
    socketio.run(app, port=3000, debug=True)

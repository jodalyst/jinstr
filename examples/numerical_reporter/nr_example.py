
#Copyright (c) 2017 Joseph D. Steinmeyer (jodalyst)
#Permission is hereby granted, free of charge, to any person obtaining a copy
#  of this software and associated documentation files (the "Software"), to deal 
#  in the Software without restriction, including without limitation the rights to use, 
#  copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the 
#  Software, and to permit persons to whom the Software is furnished to do so, subject 
#  to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies 
# or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
# INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
# PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
# TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE 
# OR OTHER DEALINGS IN THE SOFTWARE.

#questions? email me at jodalyst@mit.edu


import time
import math
from threading import Thread, Lock
from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room,close_room, rooms, disconnect

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on available packages.
#async_mode = 'threading'
#async_mode = 'eventlet'
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

    
#Start up Flask server:
app = Flask(__name__, template_folder = './',static_folder='../../src')
app.config['SECRET_KEY'] = 'secret!' #shhh don't tell anyone. Is a secret
socketio = SocketIO(app, async_mode = async_mode)
thread = None

def dataThread():
    unique3 = 125
    unique4 = 126
    amp1 = 50
    amp2 = 12
    omega1 = 10
    omega2 = 30
    count = 0
    print("start running")
    while True:
        val1 = amp1*math.sin(omega1*time.time())
        val2 = amp2*math.sin(omega2*time.time())
        socketio.emit('update_{}'.format(unique3),val1,broadcast =True)
        if count%5 == 0:
            socketio.emit('update_{}'.format(unique4),val2,broadcast =True)
        count+=1
        print('sending')
        time.sleep(0.02)

@app.route('/')
def index():
    global thread
    print ("A user connected")
    if thread is None:
        thread = Thread(target=dataThread)
        thread.daemon = True
        thread.start()
    return render_template('numerical_reporter_example.html')


if __name__ == '__main__':
    socketio.run(app, port=3000, debug=True)


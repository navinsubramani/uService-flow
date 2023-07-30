import json
import os
import time
import concurrent.futures

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
from flask_socketio import SocketIO, emit

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

#<------------------------------------------------------------->
#<-------------------- Service Logic ------------------------->
#<------------------------------------------------------------->

service_running = False
service_thread = None
service_publisher = []
service_subscribers = []

def service_core(waveform):
    if service_running:
        print("Service is running and it recieved inputs from a source")
        socketio.emit('waveformData', waveform)
        #print(waveform)
    else:
        print("Service is not running but it recieved inputs from a source")


@socketio.on('connect')
def handle_connect():
    print('A client connected!')


@socketio.on('disconnect')
def handle_disconnect():
    print('A client disconnected!')

#<------------------------------------------------------------->
#<-------------------- API Endpoints ------------------------->
#<------------------------------------------------------------->


@app.route('/api/control', methods=['POST'])
def control():
    """
    This is a endpoint through which discovery service communicates the 
    1. start command
    2. stop command
    3. connection details
    4. get status command
    """

    # Get the dictionary data from the request
    data = request.get_json()
    command = data['command']

    global service_running, service_thread, service_subscribers, service_publisher

    if command == "connection_details":
        # Get the connection details
        connection = data['connection']
        print("Recieved connection details", connection)
        service_subscribers = connection["publishesToEndpoints"]
        service_publisher = connection["subscribedTo"]

        return jsonify({"status": "success"}), 200
    
    elif command == "start_service":
        # start the service function
        if not service_running:
            print("Starting the service")
            service_running = True
            return jsonify({"status": "success"}), 200
        else:
            print("Start service request is recieved when service is running already")
            return jsonify({"status": "Already running"}), 200
    
    elif command == "stop_service":
        # stop the service function
        if service_running:
            print("Stopping the service")
            service_running = False
            return jsonify({"status": "success"}), 200
        else:
            print("Stop service request is recieved when service is stopped already")
            return jsonify({"status": "Already stopped"}), 200
    
    elif command == "get_status":
        # get the status of the service
        print("Status is being checked..")
        return jsonify({"status": "success"}), 200
    
    else:
        return jsonify({"status": "failed"}), 400


@app.route('/api/source', methods=['POST'])
def source():
    """
    Read the waveform details from the source and send it to the subscribers
    """
    print("start", time.time())
    global service_running, service_thread, service_subscribers, service_publisher

    waveform = request.get_json()

    # send the waveform to the service_core
    # Best Practice is to use queues like Celery & RabbitMQ
    with concurrent.futures.ThreadPoolExecutor() as executor:
        executor.submit(service_core, waveform)
    print("end", time.time())
    return jsonify({'status': 'success'}), 200

if __name__ == '__main__':
    host = 'localhost'
    port = 5071
    app.run(host=host, port=port, debug=True)
    print(f"Started the discovery service at {host}:{port}")
import json
import os
import time
import threading

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import requests

app = Flask(__name__)
CORS(app)

#<------------------------------------------------------------->
#<-------------------- Service Logic ------------------------->
#<------------------------------------------------------------->

service_running = False
service_thread = None
service_subscribers = []
publish_interval = 1

# Function to generate the waveform
def generate_waveform():
    """
    This method generates the waveform and publishes it to the subscribers
    """
    x = np.linspace(0, 10 * np.pi, num=600)
    waveform = np.random.normal(scale=8, size=x.size)

    return waveform

def service_core():
    while service_running:
        waveform = generate_waveform()

        publish_waveform = [
            {
                "name": "Seismometer Reading",
                "value": waveform.tolist(),
                "source": "Seismometer"
            }
        ]  

        for subscriber in service_subscribers:
            # Add the publishing code here
            response = requests.post(subscriber, json=publish_waveform)

            if response.status_code == 200:
                print("Successfully published the waveform to the subscriber", subscriber)
            else:
                print("Failed to publish the waveform to the subscriber", subscriber)
        
        time.sleep(publish_interval)

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

    global service_running, service_thread, service_subscribers

    if command == "connection_details":
        # Get the connection details
        connection = data['connection']
        print(connection)
        service_subscribers = connection["publishesToEndpoints"]

        return jsonify({"status": "success"}), 200
    
    elif command == "start_service":
        # start the service function
        if not service_running:
            service_running = True
            service_thread = threading.Thread(target=service_core)
            service_thread.start()
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "Already running"}), 200
    
    elif command == "stop_service":
        # stop the service function
        if service_running:
            service_running = False
            service_thread.join()
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "Already stopped"}), 200
    
    elif command == "get_status":
        # get the status of the service
        print("Status is being checked..")
        return jsonify({"status": "success"}), 200
    
    else:
        return jsonify({"status": "failed"}), 400

if __name__ == '__main__':
    host = 'localhost'
    port = 5051
    app.run(host=host, port=port, debug=True)
    print(f"Started the discovery service at {host}:{port}")
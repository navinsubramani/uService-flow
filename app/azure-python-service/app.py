import json
import os
import time
import concurrent.futures
import threading

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

import numpy as np

app = Flask(__name__)
CORS(app)

#<------------------------------------------------------------->
#<-------------------- Service Logic ------------------------->
#<------------------------------------------------------------->

service_running = False
service_thread = None
service_publisher = []
service_subscribers = []

def detect_anomalies(data, threshold=3.0):
    mean = np.mean(data)
    std_dev = np.std(data)
    z_scores = (data - mean) / std_dev

    # Anomalies are data points with a Z-score above the threshold
    anomalies = np.where(np.abs(z_scores) > threshold)[0]

    return anomalies


def publish_task(subscriber, waveform):
    # Add the publishing code here
    try:
        response = requests.post(subscriber, json=waveform)
        if response.status_code == 200:
            print("Successfully published the waveform to the subscriber", subscriber)
        else:
            print("Failed to recieve the 200 status from subscriber: ", subscriber)
    except Exception:
        print("Failed to publish the waveform to the subscriber: ", subscriber)

def service_core(waveform):
    if service_running:
        #print("Service is running and it recieved inputs from a source")

        for w in waveform:
            anomalies = detect_anomalies(w["value"])
            if len(anomalies) > 0:
                print("<xxxxxxxxxxxxxxxxxxxxxxxxx NEW ANOMALIES DETECTED xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx>")
                print("Anomalies detected at: ", w["name"])
                #print("Waveform data is: ", w["value"])
                print("Anomalies are at: ", anomalies)
                print("\n")
                #print("<xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx>")
            else:
                print("<------------------------------GOOD DATA------------------------------------->")
                print("Good data at: ", w["name"])
                #print("Waveform data is: ", w["value"])
                print("\n")
                #print("<------------------------------------------------------------------------------>")

        threads = []
        for subscriber in service_subscribers:
            try:
                thread = threading.Thread(target=publish_task, args=(subscriber, newWaveform))
                thread.start()
                threads.append(thread)
            except Exception:
                print("Failed to call the publish thread: ", subscriber)
        
        for thread in threads:
            thread.join()

    else:
        print("Service is not running but it recieved inputs from a source")

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
    #print("start", time.time())
    global service_running, service_thread, service_subscribers, service_publisher

    waveform = request.get_json()

    # send the waveform to the service_core
    # Best Practice is to use queues like Celery & RabbitMQ
    with concurrent.futures.ThreadPoolExecutor() as executor:
        executor.submit(service_core, waveform)
    #print("end", time.time())
    return jsonify({'status': 'success'}), 200

if __name__ == '__main__':
    host = 'localhost'
    port = 5062
    app.run(host=host, port=port, debug=True)
    print(f"Started the discovery service at {host}:{port}")
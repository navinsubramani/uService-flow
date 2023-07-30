import json
import os
import time

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests


app = Flask(__name__)
CORS(app)


def get_service_from_registery():
    """
    Reads the service information from the Registry file
    """
    with open('services_registry.json') as f:
        services = json.load(f)
        return services


def get_service_details_from_name(all_service_details, service_name):
    """
    Reads the services.json file and returns the details of a service
    """
    for service in all_service_details:
        if service['serviceName'] == service_name:
            return service
    return None


ALL_SERVICE_DETAILS = get_service_from_registery()
orchestration = {}

@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def static_file(path):
    return app.send_static_file(path)


@app.route('/api/getServiceDetails', methods=['GET'])
def get_service_details():
    """
    Reads the services.json file and returns the details of a service
    """

    global ALL_SERVICE_DETAILS

    updated_services = []
    for service in ALL_SERVICE_DETAILS:
        # make a post rest call to the  control endpoint of the service to
        # get the status of the service
        # and update the service alive status acordingly
        CONTROL_ENDPOINT = service['serviceControlEndpoint']
        try:
            response = requests.post(CONTROL_ENDPOINT, json={"command": "get_status"})
            if response.status_code == 200:
                service['live'] = True
                print("live", response.json())
            else:
                service['live'] = False
                print("not live", response.json())
        except Exception:
            service['live'] = True
        updated_services.append(service)

    print("Sending the registered service details and its live status...")
    return jsonify(updated_services)


@app.route('/api/publish', methods=['POST'])
def publish_service():
    """
    Publishes a service details and the congifurations
    """
    data = request.get_json()
    nodes = data['nodes']
    edges = data['edges']

    global ALL_SERVICE_DETAILS, orchestration

    # stops all the existing orchestration
    stop_service()

    # update the configuration in the internal memory
    temp_orchestration = {}
    for node in nodes:
        service_details = get_service_details_from_name(ALL_SERVICE_DETAILS, node)
        temp_orchestration[node] = {
            "controlEndpoint": service_details['serviceControlEndpoint'],
            "subscribedTo": [],
            "publishesTo": [],
            "publishesToEndpoints": [],
        }
        for edge in edges:
            if edge['source'] == node:
                temp_orchestration[node]['publishesTo'].append(edge['target'])
                service_details = get_service_details_from_name(ALL_SERVICE_DETAILS, edge['target'])
                temp_orchestration[node]['publishesToEndpoints'].append(service_details['serviceSourceEndpoint'])
            if edge['target'] == node:
                temp_orchestration[node]['subscribedTo'].append(edge['source'])
    
    orchestration = temp_orchestration
    print(orchestration)

    return jsonify({"status": "success"})


@app.route('/api/startService', methods=['GET'])
def start_service():
    """
    Starts a service
    """
    global orchestration

    for service, service_details in orchestration.items():
        # make a post rest call to the  control endpoint of the service to
        # start the service
        CONTROL_ENDPOINT = service_details['controlEndpoint']
        try:
            # POST the configuration
            response = requests.post(CONTROL_ENDPOINT,
                            json={
                                "command": "connection_details", 
                                "connection": {
                                        "subscribedTo": service_details['subscribedTo'],
                                        "publishesTo": service_details['publishesTo'],
                                        "publishesToEndpoints": service_details['publishesToEndpoints']
            }})

            # Post the start command
            response = requests.post(CONTROL_ENDPOINT, json={"command": "start_service"})
            if response.status_code == 200:
                print("live", response.json())
            else:
                print("not live", response.json())
        except Exception:
            pass

    return jsonify({"status": "success"})


@app.route('/api/stopService', methods=['GET'])
def stop_service():
    """
    Stops a service
    """
    global orchestration

    for service, service_details in orchestration.items():
        # make a post rest call to the  control endpoint of the service to
        # stop the service
        CONTROL_ENDPOINT = service_details['controlEndpoint']
        try:
            response = requests.post(CONTROL_ENDPOINT, json={"command": "stop_service"})
            if response.status_code == 200:
                print("live", response.json())
            else:
                print("not live", response.json())
        except Exception:
            pass
    return jsonify({"status": "success"})


if __name__ == '__main__':
    host = 'localhost'
    port = 5050
    app.run(host=host, port=port, debug=True)
    print(f"Started the discovery service at {host}:{port}")
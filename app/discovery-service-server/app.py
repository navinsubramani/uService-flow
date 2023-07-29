import json
import os
import time

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def static_file(path):
    return app.send_static_file(path)


@app.route('/api/getServiceDetails', methods=['GET'])
def get_service_details():
    """
    Reads the services.json file and returns the details of a service
    """
    with open('services_registry.json') as f:
        services = json.load(f)

        updated_services = []
        for service in services:
            service["live"] = True
            updated_services.append(service)
    return jsonify(updated_services)


@app.route('/api/publish', methods=['POST'])
def publish_service():
    """
    Publishes a service details and the congifurations
    """
    data = request.get_json()
    print(data)

    return jsonify({"status": "success"})


@app.route('/api/startService', methods=['GET'])
def start_service():
    """
    Starts a service
    """
    return jsonify({"status": "success"})


@app.route('/api/stopService', methods=['GET'])
def stop_service():
    """
    Stops a service
    """
    return jsonify({"status": "success"})


if __name__ == '__main__':
    host = 'localhost'
    port = 5050
    app.run(host=host, port=port, debug=True)
    print(f"Started the discovery service at {host}:{port}")
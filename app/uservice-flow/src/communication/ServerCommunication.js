const BASE_URL = "http://localhost:5050";
const SERVICE_DETAILS_ENDPOINT = BASE_URL + "/api/getServiceDetails";
const PUBLISH_ENDPOINT = BASE_URL + "/api/publish";
const START_SERVICE_ENDPOINT = BASE_URL + "/api/startService";
const STOP_SERVICE_ENDPOINT = BASE_URL + "/api/stopService";



function get_node_details(func) {
    // read the node information from the backend
    fetch(SERVICE_DETAILS_ENDPOINT)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // and then create the nodes in the sidebar
            func(data);
        })
        .catch(error => console.log(error));
}

function publish_configuration({usedNodeTypes, usedNodeConnections}) {
    // publish the node & edge information to the backend
    fetch(PUBLISH_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nodes: usedNodeTypes,
            edges: usedNodeConnections
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => console.log(error))
}

function start_service() {
    // start the service
    fetch(START_SERVICE_ENDPOINT)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => console.log(error))
}

function stop_service() {
    // stop the service
    fetch(STOP_SERVICE_ENDPOINT)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => console.log(error))
}

export { get_node_details, publish_configuration, start_service, stop_service }
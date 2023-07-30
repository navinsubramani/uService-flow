import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './FlowPanel.css';

import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useNodes,
  useEdges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Button from '@mui/material/Button';
import PublishIcon from '@mui/icons-material/Publish';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import LoadingButton from '@mui/lab/LoadingButton';

import { UPDATE_USED_NODE_TYPES, UPDATE_USED_NODE_CONNECTIONS } from '../SideBar/SideBarSlice';
import { CreateCustomNode } from '../../nodes/measurementNodes/MeasurementNodes.js';
import { publish_configuration, start_service, stop_service } from '../../communication/ServerCommunication';

const initialNodes = [];
const initialEdges = [];
let id = 0;
const getId = (type) => `${type}_uid_${id++}`;

export function FlowPanel({children}) {

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // These are the custom nodes created based on the services that are instantiated dynamically
  const services = useSelector((state) => state.SideBar.allServices);
  const [customNodeTypes, setCustomNodeTypes] = useState({});

  useEffect(() => {
    // update the redux store with the node types
    const tempCustomNodeTypes = CreateCustomNode(services);
    setCustomNodeTypes({...CreateCustomNode(services)});
    console.log("Updated the register node type", tempCustomNodeTypes);
  }, [services]);



  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  // Drag & Drop Controls

  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(type),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );


  return (
    <div style={{ height: '100vh', width: '100%' }} className='flow-panel-base'>
      <FlowPanelToolBar />
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            nodeTypes={customNodeTypes}
            onNodesChange={onNodesChange}
            edges={edges}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}

          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        <NodeAndEdgeLogger />
      </ReactFlowProvider>
  
    </div>
  );
}

export function FlowPanelToolBar() {

  const usedNodeTypes = useSelector((state) => state.SideBar.usedNodeTypes);
  const usedNodeConnections = useSelector((state) => state.SideBar.usedNodeConnections);

  const [publishLoading, setPublishLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);

  const onPublish = useCallback(() => {
    console.log("Publishing the configuration");
    publish_configuration({usedNodeTypes, usedNodeConnections}, onControlCommandResponse);
    setPublishLoading(true);
  }, [usedNodeTypes, usedNodeConnections]);

  const onStartService = useCallback(() => {
    console.log("Starting the service");
    start_service(onControlCommandResponse);
    setStartLoading(true);
  }, []);

  const onStopService = useCallback(() => {
    console.log("Stopping the service");
    stop_service(onControlCommandResponse);
    setStopLoading(true);
  }, []);

  const onControlCommandResponse = useCallback((response) => {
    if (response === "published") {
    setPublishLoading(false);
    } else if (response === "started") {
    setStartLoading(false);
    } else if (response === "stopped") {
    setStopLoading(false);
    } else {
    console.log("Unknown Command Control Response: ", response);
    }
  }, []);

  return(
  <div className='flow-panel-header'>
    {
      publishLoading ?
      <LoadingButton variant="outlined" color={"info"} loading className='flow-panel-header-button'>
        Publish
      </LoadingButton>
      :
      <Button variant="outlined" startIcon={<PublishIcon />} onClick={onPublish} className='flow-panel-header-button'>
        Publish
      </Button>
    }
    {
      startLoading ?
      <LoadingButton variant="outlined" color={"success"} loading className='flow-panel-header-button'>
        Start
      </LoadingButton>
      :
      <Button variant="outlined" color={"success"} startIcon={<PlayArrowIcon />} onClick={onStartService} className='flow-panel-header-button'>
        Start
      </Button>
    }
    {
      stopLoading ?
      <LoadingButton variant="outlined" color={"error"} loading className='flow-panel-header-button'>
        Stop
      </LoadingButton>
      :
      <Button variant="outlined" color={"error"} startIcon={<StopIcon />} onClick={onStopService} className='flow-panel-header-button'>
        Stop
      </Button>
    }
  </div>)
}


export function NodeAndEdgeLogger() {
  const nodes = useNodes();
  const edges = useEdges();
  const usedNodeTypes = useSelector((state) => state.SideBar.usedNodeTypes);
  const usedNodeConnections = useSelector((state) => state.SideBar.usedNodeConnections);
  const dispatch = useDispatch();

  useEffect(() => {
    let nodeNames = nodes.map(node => node.type);
    if (usedNodeTypes.length !== nodeNames.length) {
      dispatch(UPDATE_USED_NODE_TYPES(nodeNames))
      console.log("Updated nodes: ", nodeNames);
    }

    if (usedNodeConnections.length !== edges.length) {
      let connectPairs = edges.map(edge => {
        return {
        source: edge.source.split("_uid_")[0],
        sourceHandle: edge.sourceHandle,
        target: edge.target.split("_uid_")[0],
        targetHandle: edge.targetHandle,
        }
      });
      dispatch(UPDATE_USED_NODE_CONNECTIONS(connectPairs))
      console.log("Updated edges: ", connectPairs);
    }

  }, [nodes, edges]);

  return null;
}
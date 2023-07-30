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


import { UPDATE_USED_NODE_TYPES, UPDATE_USED_NODE_CONNECTIONS } from '../SideBar/SideBarSlice';
import { CreateCustomNode } from '../../nodes/measurementNodes/MeasurementNodes.js';

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
    <div className='flow-panel-base'>
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
import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './SideBar.css';

import IconButton from '@mui/material/IconButton';
import SensorsIcon from '@mui/icons-material/Sensors';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CastIcon from '@mui/icons-material/Cast';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import SyncIcon from '@mui/icons-material/Sync';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import { get_node_details } from '../../communication/ServerCommunication.js';
import { UPDATE_ALL_SERVICES } from './SideBarSlice';

export function SideBar() {
  const usedNodeTypes = useSelector((state) => state.SideBar.usedNodeTypes);
  const services = useSelector((state) => state.SideBar.allServices);
  const dispatch = useDispatch();
  
  useEffect(() => {
    // read the node information from the backend
    // and then create the nodes in the sidebar
    sync_services()
  }, []);
  
  const sync_services = useCallback(() => {
    // read the node information from the backend
    console.log("Syncing the services information");
    get_node_details((data) => dispatch(UPDATE_ALL_SERVICES(data)));
  }, []);

  const updateSidebar = (services, category, usedNodeTypes) => {

    let ui_services = [];
    for (const service of services) {
      if (service.category === category) {
        const category_classname = {
          "AcquisitionNode": "dndnode nodeacquisition",
          "AnalysisNode": "dndnode nodeanalysis",
          "DisplayNode": "dndnode nodedisplay",
          "EventNode": "dndnode nodealert"
        }
        const node_unusable = usedNodeTypes.includes(service.serviceName) || !service.live;
        let status_icon = <DragHandleIcon className='dndnode-status-icon'/>
        if (!service.live) {
          status_icon = <FiberManualRecordIcon className='dndnode-status-icon' htmlColor='rgb(235, 86, 86)'/>
        }
        else if (node_unusable) {
          status_icon = <FiberManualRecordIcon className='dndnode-status-icon' htmlColor='rgb(80, 238, 59)'/>
        }

        ui_services.push(
          <div className={category_classname[category]} key={service.serviceName} onDragStart={(event) => onDragStart(event, service.serviceName)} draggable={!node_unusable}>
            {service.serviceName}
            {status_icon}
          </div>
        );
      }
    }
    return ui_services;     
  }
  
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="side-bar-base">
      <div className="side-bar-header">
        <strong>Services</strong>
        <IconButton color="primary" size="small" onClick={sync_services}>
          <SyncIcon />
        </IconButton>
      </div>

      <div className="side-bar-subheader">
        <SensorsIcon />
        AcquisitionNodes
      </div>
      {updateSidebar(services, "AcquisitionNode", usedNodeTypes)}

      <div className="side-bar-subheader">
        <QueryStatsIcon />
        AnalysisNode
      </div>
      {updateSidebar(services, "AnalysisNode", usedNodeTypes)}

      <div className="side-bar-subheader">
        <CastIcon />
        DisplayNode
      </div>
      {updateSidebar(services, "DisplayNode", usedNodeTypes)}

      <div className="side-bar-subheader">
        <AddAlertIcon />
        EventNode
      </div>
      {updateSidebar(services, "EventNode", usedNodeTypes)}

    </aside>
  );
};

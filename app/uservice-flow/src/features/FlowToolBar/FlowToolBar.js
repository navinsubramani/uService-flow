import React, { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Button from '@mui/material/Button';
import PublishIcon from '@mui/icons-material/Publish';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import LoadingButton from '@mui/lab/LoadingButton';

import './FlowToolBar.css';

import { publish_configuration, start_service, stop_service } from '../../communication/ServerCommunication';

export default function FlowPanelToolBar() {

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
  
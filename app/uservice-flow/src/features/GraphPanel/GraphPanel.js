import React, {  useEffect } from 'react';

import CanvasJSReact from '@canvasjs/react-charts';
//var CanvasJSReact = require('@canvasjs/react-charts');
import io from 'socket.io-client';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails'; 
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

//Create Chart
export default function GraphPanel({data}) {

    const [waveforms, setWaveforms] = React.useState([])
    const headerName = "Web Viewer"

    useEffect(() => {
        // Socket event listeners
        const socket = io.connect('http://localhost:5071');
        console.log("Setting up socket listeners");
        socket.on('connect', () => {
            console.log('Connected to server');
        });
    
        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
    
        socket.on('waveformData', (waveforms) => {
            setWaveforms(waveforms);
            console.log(waveforms);
            });
    
        return () => {
          console.log("Disconnecting from Socket");
          socket.disconnect();
        };
      }, []);

    const options = {
        animationEnabled: true,
        /*
        title:{
            text: headerName,
        },
        */
        axisY : {
            title: "Amplitude",
        },
        toolTip: {
            shared: true
        },
        data:  waveforms.map((waveform) => {
            return ({
                type: "spline",
                name: waveform.name,
                showInLegend: true,
                dataPoints: waveform.value.map((value, index) => {
                return ({
                    label: index,
                    y: value,
                })
            })
        })})
    }

    const waveformNameHeader = waveforms.map((waveform) => waveform.name).join("-");

    console.log("options",options);
              
    return (
    <div>
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                >
                <strong>{headerName}{" : "}{waveformNameHeader}</strong>
            </AccordionSummary>
            <AccordionDetails>
            <CanvasJSChart options = {options}
            /* onRef = {ref => this.chart = ref} */
            />
            </AccordionDetails>
        </Accordion>
    </div>
    );
}
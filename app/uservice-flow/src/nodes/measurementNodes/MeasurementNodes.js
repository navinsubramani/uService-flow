import { Handle, Position } from 'reactflow';

import SensorLogo from './../../media/sensor.jpg'
import AnalysisLogo from './../../media/analysis-1.png'
import DisplayLogo from './../../media/display.jpg'
import FailureLogo from './../../media/failure-icon.jpg'

import "./MeasurementNodes.css"


const CreateCustomNode = (services) => {

  let service_registery = {};

  for (const service of services) {
    if (service.category === "AcquisitionNode") {
      service_registery[service.serviceName] = ({ data, isConnectable }) => {
        return (
          <div className="measurement-node acquisition-node" key={service.serviceName}>
            <strong>
              {service.serviceName}
            </strong>
            <img className="measurement-node-logo" src={SensorLogo} alt="Sensor" />
            <Handle type="source" position={Position.Bottom} id="acq-a" isConnectable={true} />
          </div>
          );
      }
    } else if (service.category === "AnalysisNode") {
      service_registery[service.serviceName] = ({ data, isConnectable }) => {
        return (
          <div className="measurement-node analysis-node" key={service.serviceName}>
            <Handle type="target" position={Position.Top} id="ana-a" isConnectable />
            <strong>
              {service.serviceName}
            </strong>
            <img className="measurement-node-logo" src={AnalysisLogo} alt="Analysis" />
            <Handle type="source" position={Position.Bottom} id="ana-b" isConnectable={true} />
          </div>
        )
      }
    } else if (service.category === "DisplayNode") {
      service_registery[service.serviceName] = ({ data, isConnectable }) => {
        return (
          <div className="measurement-node display-node">
            <Handle 
            type="target" position={Position.Top} id="dis-a" isConnectable={isConnectable} 
            />
            <strong>
              {service.serviceName}
            </strong>
            <img className="display-node-logo" src={DisplayLogo} alt="Display" />
          </div>
        );
      }
    } else if (service.category === "EventNode") {
        service_registery[service.serviceName] = ({ data, isConnectable }) => {
          return (
            <div className="measurement-node event-node">
              <Handle 
              type="target" position={Position.Top} id="event-a" isConnectable={isConnectable} 
              />
              <strong>
                {service.serviceName}
              </strong>
              <img className="event-node-logo" src={FailureLogo} alt="Event" />
              <Handle type="source" position={Position.Bottom} id="event-b" isConnectable={isConnectable} />
            </div>
          );
        }
  }
}

  return service_registery;
}

export  { CreateCustomNode };
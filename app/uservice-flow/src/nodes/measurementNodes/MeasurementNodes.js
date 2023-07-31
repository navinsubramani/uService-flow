import { Handle, Position } from 'reactflow';

import SensorLogo from './../../media/sensor.jpg'
import AnalysisLogo from './../../media/analysis-1.png'
import DisplayLogo from './../../media/display.jpg'
import FailureLogo from './../../media/failure-icon.jpg'

import LabVIEWLogo from './../../media/labview.svg'
import PythonLogo from './../../media/Python.png'
import WindowsLogo from './../../media/Windows.png'
import LinuxLogo from './../../media/Linux.png'
import ComputerLogo from './../../media/computer.jpg'
import AzureLogo from './../../media/Azure.png'

import "./MeasurementNodes.css"


const CreateCustomNode = (services) => {

  let service_registery = {};

  for (const service of services) {
    if (service.category === "AcquisitionNode") {
      service_registery[service.serviceName] = ({ data, isConnectable }) => {
        return (
          <div className="measurement-node" key={service.serviceName}>
            <strong className='acquisition-node'>{service.serviceName}</strong>
            <div className='measurement-info'>
              <TechnologyDisplay language={service.language} os={service.os} host={service.host} />
              <p>{service.serviceDescription}</p>
            </div>
            <Handle type="source" position={Position.Bottom} id="acq-a" isConnectable={true} />
          </div>
          );
      }
    } else if (service.category === "AnalysisNode") {
      service_registery[service.serviceName] = ({ data, isConnectable }) => {
        return (
          <div className="measurement-node" key={service.serviceName}>
            <Handle type="target" position={Position.Top} id="ana-a" isConnectable />
            <strong className='analysis-node'>{service.serviceName}</strong>
            <div className='measurement-info'>
              <TechnologyDisplay language={service.language} os={service.os} host={service.host} />
              <p>{service.serviceDescription}</p>
            </div>
            <Handle type="source" position={Position.Bottom} id="ana-b" isConnectable={true} />
          </div>
        )
      }
    } else if (service.category === "DisplayNode") {
      service_registery[service.serviceName] = ({ data, isConnectable }) => {
        return (
          <div className="measurement-node">
            <Handle 
            type="target" position={Position.Top} id="dis-a" isConnectable={isConnectable} 
            />
            <strong className='display-node'>{service.serviceName}</strong>
            <div className='measurement-info'>
              <TechnologyDisplay language={service.language} os={service.os} host={service.host} />
              <p>{service.serviceDescription}</p>
            </div>
          </div>
        );
      }
    } else if (service.category === "EventNode") {
        service_registery[service.serviceName] = ({ data, isConnectable }) => {
          return (
            <div className="measurement-node">
              <Handle 
              type="target" position={Position.Top} id="event-a" isConnectable={isConnectable} 
              />
            <strong className='event-node'>{service.serviceName}</strong>
            <div className='measurement-info'>
              <TechnologyDisplay language={service.language} os={service.os} host={service.host} />
              <p>{service.serviceDescription}</p>
            </div>
            </div>
          );
        }
  }
}

  return service_registery;
}

const TechnologyDisplay = ({ language, os, host }) => {

  const language_display = (language) => {
    if (language === "Python") {
      return <img className="technology-logo" src={PythonLogo} alt="Python" />
    } else if (language === "LabVIEW") {
      return <img className="technology-logo" src={LabVIEWLogo} alt="LabVIEW" />
    }
  }

  const os_display = (os) => {
    if (os === "Windows") {
      return <img className="technology-logo" src={WindowsLogo} alt="Windows" />
    } else if (os === "Linux") {
      return <img className="technology-logo" src={LinuxLogo} alt="Linux" />
    }
  }

  const host_display = (host) => {
    if (host === "Azure") {
      return <img className="technology-logo" src={AzureLogo} alt="Azure" />
    } else if (host === "Local") {
      return <img className="technology-logo" src={ComputerLogo} alt="Local" />
    }
  }

  return (
    <div className='measurement-node-technology-base'>
      {language_display(language)}
      {os_display(os)}
      {host_display(host)}
    </div>
  )
}

export  { CreateCustomNode, TechnologyDisplay };
import React from 'react';
import { FlowPanel } from './features/FlowPanel/FlowPanel';
import { SideBar } from './features/SideBar/SideBar';
import FlowPanelToolBar from './features/FlowToolBar/FlowToolBar';
import GraphPanel from './features/GraphPanel/GraphPanel';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className='App-Orchestrator'>
        <SideBar />
        <div className='App-Flow-Control-Space'>
          <FlowPanelToolBar />
          <FlowPanel />
        </div>
      </div>
      <GraphPanel />
    </div>

  );
}

export default App;

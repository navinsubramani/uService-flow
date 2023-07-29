import React from 'react';
import { FlowPanel } from './features/FlowPanel/FlowPanel';
import { SideBar } from './features/SideBar/SideBar';
import './App.css';

function App() {
  return (
    <div className="App">
      <SideBar />
      <FlowPanel />
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import StoryMode from './components/StoryMode';
import RigDisplay from './components/RigDisplay';
// import TerminalInterface from './components/TerminalInterface'; // Your actual game UI

export default function App() {
  // Define the modes: 'STORY' | 'GAMEPLAY'
  const [currentMode, setCurrentMode] = useState('STORY');

  // Your global game state (inventory, rig heat, etc.)
  const [rigState, setRigState] = useState({
    heat: 40,
    power: 450,
    parts: { cpu: 'cpu_01', gpu: 'gpu_01' }
  });

  // The function passed to StoryMode to trigger the transition
  const handleStoryComplete = () => {
    setCurrentMode('GAMEPLAY');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#05080c' }}>
      
      {currentMode === 'STORY' && (
        <StoryMode onComplete={handleStoryComplete} />
      )}

      {currentMode === 'GAMEPLAY' && (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          
          {/* Left Side: The actual hacking game interface (Terminal, Map, etc) */}
          <div style={{ flex: 1, padding: '20px' }}>
            <h1 style={{ color: '#78dce8', fontFamily: 'monospace' }}>SYNTAX SYNDICATE TERMINAL</h1>
            {/* <TerminalInterface /> */}
            <p style={{ color: '#fff' }}>[Gameplay Interface Goes Here]</p>
          </div>

          {/* Right Side: The live, interactive RigDisplay monitoring your hardware */}
          <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-start' }}>
            <RigDisplay 
              rig={rigState.parts} 
              heat={rigState.heat} 
              expanded={true} 
              // isProcessing={...} // Hook this up to your terminal execution state
            />
          </div>

        </div>
      )}

    </div>
  );
}

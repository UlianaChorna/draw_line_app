import React from 'react';
import DrawingArea from './drawingArea/DrawingArea';

function App() {
  return (
    <div className="App" onContextMenu={ e =>  false}>
      <DrawingArea/>
    </div>
  );
}

export default App;

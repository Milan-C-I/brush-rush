import React, { useState, useRef, useEffect } from 'react';

const DrawingDebugTest = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;
    
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#000';
    context.lineWidth = 3;
  }, []);

  // Listen for remote drawing events
  useEffect(() => {
    const handleRemoteDrawing = (e) => {
      console.log('Remote drawing event received:', e.detail);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const event = e.detail;

      if (event.type === 'start') {
        context.beginPath();
        context.moveTo(event.x, event.y);
      } else if (event.type === 'draw') {
        context.lineTo(event.x, event.y);
        context.stroke();
        context.beginPath();
        context.moveTo(event.x, event.y);
      }
    };

    window.addEventListener('remote-drawing-event', handleRemoteDrawing);
    return () => window.removeEventListener('remote-drawing-event', handleRemoteDrawing);
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const context = canvasRef.current.getContext('2d');
    context.beginPath();
    context.moveTo(x, y);

    const event = { type: 'start', x, y, color: '#000', size: 3, opacity: 100, tool: 'brush' };
    setEvents(prev => [...prev, event]);
    
    // Simulate sending to other players
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('remote-drawing-event', { detail: event }));
    }, 100);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const context = canvasRef.current.getContext('2d');
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);

    const event = { type: 'draw', x, y, color: '#000', size: 3, opacity: 100, tool: 'brush' };
    setEvents(prev => [...prev, event]);
    
    // Simulate sending to other players
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('remote-drawing-event', { detail: event }));
    }, 100);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const event = { type: 'end', x: 0, y: 0, color: '#000', size: 3, opacity: 100, tool: 'brush' };
    setEvents(prev => [...prev, event]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    setEvents([]);
  };

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Drawing Synchronization Debug Test</h1>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Original Canvas */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Your Drawing (Original)</h2>
            <canvas
              ref={canvasRef}
              className="border-2 border-blue-500 bg-white cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              width={400}
              height={300}
            />
          </div>

          {/* Simulated Remote Canvas */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Remote Player View (Simulated)</h2>
            <canvas
              className="border-2 border-green-500 bg-white"
              width={400}
              height={300}
              style={{ pointerEvents: 'none' }}
            />
            <p className="text-sm text-gray-400 mt-2">
              This canvas receives the same events as other players would
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button 
            onClick={clearCanvas}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white"
          >
            Clear Canvas
          </button>
        </div>

        {/* Event Log */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Drawing Events Log</h3>
          <div className="bg-slate-800 p-4 rounded max-h-40 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-gray-400">No drawing events yet. Start drawing!</p>
            ) : (
              events.slice(-10).map((event, index) => (
                <div key={index} className="text-sm text-gray-300 mb-1">
                  <span className={`inline-block w-12 text-xs font-mono ${
                    event.type === 'start' ? 'text-green-400' : 
                    event.type === 'draw' ? 'text-blue-400' : 'text-red-400'
                  }`}>
                    {event.type}
                  </span>
                  {event.type !== 'end' && (
                    <span>({Math.round(event.x)}, {Math.round(event.y)})</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-800 rounded">
          <h3 className="text-lg font-semibold mb-2">Instructions</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Draw on the left canvas (Your Drawing)</li>
            <li>• The right canvas simulates what other players would see</li>
            <li>• Check if both canvases show the same drawing</li>
            <li>• Events are logged below for debugging</li>
            <li>• If remote canvas doesn't update, there's a synchronization issue</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DrawingDebugTest;
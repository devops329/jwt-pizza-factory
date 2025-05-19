import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div>
      <h1>Welcome to JWT Pizza Factory</h1>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

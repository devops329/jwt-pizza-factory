import React from 'react';
import { createRoot } from 'react-dom/client';
import Login from './login';
import Dashboard from './dashboard';

function App() {
  const [authToken, setAuthToken] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  function logout() {
    setAuthToken(null);
    localStorage.removeItem('authToken');
  }

  return (
    <div>
      <header className="bg-gray-800 text-white py-6 px-2 flex flex-row justify-between">
        <h1 className="text-4xl font-extrabold text-white text-center drop-shadow-lg tracking-wide">🍕 JWT Pizza Factory</h1>
        {authToken && (
          <button onClick={logout} className="bg-orange-200 hover:bg-orange-300 text-gray-800 font-bold py-2 px-4 rounded">
            Logout
          </button>
        )}
      </header>
      <main className="mx-auto max-w-4xl p-2 bg-gray-100">{authToken ? <Dashboard authToken={authToken} /> : <Login setAuthToken={setAuthToken} />}</main>
      <footer className="bg-gray-800 text-white py-6">
        <p className="text-center text-sm">&copy; 2035 JWT Pizza Factory. All rights reserved.</p>
      </footer>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

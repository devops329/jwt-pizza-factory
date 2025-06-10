import React from 'react';
import Login from './login';
import Dashboard from './dashboard';
import service from './service';
import { Vendor } from './model';

export default function App() {
  const [vendor, setVendor] = React.useState<Vendor | null>(null);

  React.useEffect(() => {
    (async () => {
      if (localStorage.getItem('token') !== null) {
        try {
          const vendor = await service.getVendor();
          setVendor(vendor);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
    })();
  }, []);

  function logout() {
    setVendor(null);
    localStorage.removeItem('token');
  }

  return (
    <div>
      <header className="bg-gray-800 text-white py-6 px-2 flex flex-row justify-between">
        <h1 className="text-4xl font-extrabold text-white text-center drop-shadow-lg tracking-wide">🍕 JWT Pizza Factory</h1>
        {vendor && (
          <button onClick={logout} className="bg-orange-200 hover:bg-orange-300 text-gray-800 font-bold py-2 px-4 rounded">
            Logout
          </button>
        )}
      </header>
      <main className="p-2 bg-gray-100">{vendor ? <Dashboard vendor={vendor} /> : <Login setVendor={setVendor} />}</main>
      <footer className="bg-gray-800 text-white py-6">
        <p className="text-center text-sm">&copy; 2035 JWT Pizza Factory. All rights reserved.</p>
      </footer>
    </div>
  );
}

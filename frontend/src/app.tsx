import React from 'react';
import Login from './login';
import Dashboard from './dashboard';

export default function App() {
  const [vendor, setVendor] = React.useState(null);

  React.useEffect(() => {
    const vendor = localStorage.getItem('vendor');
    if (vendor) {
      setVendor(vendor);
    }
  }, []);

  function logout() {
    setVendor(null);
    localStorage.removeItem('vendor');
  }

  return (
    <div>
      <header className='bg-gray-800 text-white py-6 px-2 flex flex-row justify-between'>
        <h1 className='text-4xl font-extrabold text-white text-center drop-shadow-lg tracking-wide'>🍕 JWT Pizza Factory</h1>
        {vendor && (
          <button onClick={logout} className='bg-orange-200 hover:bg-orange-300 text-gray-800 font-bold py-2 px-4 rounded'>
            Logout
          </button>
        )}
      </header>
      <main className='p-2 bg-gray-100'>{vendor ? <Dashboard vendor={vendor} /> : <Login setVendor={setVendor} />}</main>
      <footer className='bg-gray-800 text-white py-6'>
        <p className='text-center text-sm'>&copy; 2035 JWT Pizza Factory. All rights reserved.</p>
      </footer>
    </div>
  );
}

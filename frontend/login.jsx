import React from 'react';

export default function Login({ setAuthToken }) {
  const [netId, setNetId] = React.useState();
  const [inputValue, setInputValue] = React.useState('');

  const getCode = (e) => {
    e.preventDefault();
    setNetId(inputValue);
    setInputValue('');
  };

  const processCode = (e) => {
    e.preventDefault();

    (async () => {
      try {
        const response = await fetch('/api/vendor/auth', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: inputValue }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        localStorage.setItem('authToken', data.authToken);
        setAuthToken(data.authToken);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    })();
  };

  return (
    <div>
      {!netId ? (
        <div className="flex items-start justify-center">
          <form onSubmit={getCode} className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-80 my-6">
            <label htmlFor="login" className="text-gray-700 font-semibold">
              BYU Net ID
            </label>
            <div className="text-sm text-gray-500">This will email an authentication code to the email associated with your Net ID.</div>
            <input id="login" type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button disabled={!inputValue} type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
              Get code
            </button>
          </form>
        </div>
      ) : (
        <div className="flex items-start justify-center">
          <form onSubmit={processCode} className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-80 my-6">
            <label htmlFor="login" className="text-gray-700 font-semibold">
              Authentication code
            </label>
            <input id="login" type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button disabled={!inputValue} type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

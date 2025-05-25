import React from 'react';

import service from './service';

export default function Login({ setVendor }) {
  const [netId, setNetId] = React.useState('test3');
  const [inputValue, setInputValue] = React.useState('');

  const requestCode = async (e) => {
    e.preventDefault();

    await service.requestCode(inputValue);
    setNetId(inputValue);
    setInputValue('');
  };

  const processCode = (e) => {
    e.preventDefault();

    (async () => {
      const [vendor, token] = await service.authenticate(inputValue);
      setVendor(vendor);
    })();
  };

  return (
    <div>
      {!netId ? (
        <div className='flex items-start justify-center'>
          <form onSubmit={requestCode} className='bg-white p-8 rounded shadow-md flex flex-col gap-4 w-80 my-6'>
            <label htmlFor='login' className='text-gray-700 font-semibold'>
              BYU Net ID
            </label>
            <input
              id='login'
              type='text'
              value={inputValue}
              placeholder='Enter your BYU Net ID'
              onChange={(e) => setInputValue(e.target.value)}
              className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400'
            />
            <button
              disabled={!inputValue}
              type='submit'
              className='bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              Get code
            </button>
          </form>
        </div>
      ) : (
        <div className='flex items-start justify-center'>
          <form onSubmit={processCode} className='bg-white p-8 rounded shadow-md flex flex-col gap-4 w-80 my-6'>
            <label htmlFor='login' className='text-gray-700 font-semibold'>
              Authenticate code
            </label>
            <div className='text-sm text-gray-500'>
              Provide the code sent to <b>{netId}.byu.edu</b>.
            </div>
            <input
              id='login'
              type='text'
              value={inputValue}
              placeholder='Enter code'
              onChange={(e) => setInputValue(e.target.value)}
              className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400'
            />
            <button
              disabled={!inputValue}
              type='submit'
              className='bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              Validate code
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

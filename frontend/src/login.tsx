import React from 'react';

import service from './service';

export default function Login({ setVendor }) {
  const [netId, setNetId] = React.useState<string>('');
  const [inputValue, setInputValue] = React.useState<string>('');
  const [showVendorDialog, setShowVendorDialog] = React.useState(false);

  const requestCode = async (e) => {
    e.preventDefault();

    const vendorExists = await service.vendorExists(inputValue);
    if (vendorExists) {
      await service.requestCode(inputValue);
      setNetId(inputValue);
      setInputValue('');
    } else {
      setShowVendorDialog(true);
    }
  };

  const processCode = (e) => {
    e.preventDefault();

    (async () => {
      try {
        const vendor = await service.authenticate(netId, inputValue);
        setVendor(vendor);
      } catch (error) {
        alert(error.message || 'An error occurred during authentication.');
      }
    })();
  };

  return (
    <div>
      {!netId ? (
        <div className="flex items-start justify-center">
          <form onSubmit={requestCode} className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-80 my-6">
            <label htmlFor="login" className="text-gray-700 font-semibold">
              Login
            </label>
            <input id="login" type="text" value={inputValue} placeholder="Enter your BYU Net ID" onChange={(e) => setInputValue(e.target.value)} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button disabled={!inputValue} type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
              Get code
            </button>
          </form>
        </div>
      ) : (
        <div className="flex items-start justify-center">
          <form onSubmit={processCode} className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-80 my-6">
            <label htmlFor="login" className="text-gray-700 font-semibold">
              Authenticate code
            </label>
            <div className="text-sm text-gray-500">
              Provide the code sent to <b>{netId}@byu.edu</b>.
            </div>
            <input id="login" type="text" value={inputValue} placeholder="Code" onChange={(e) => setInputValue(e.target.value)} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button disabled={!inputValue} type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
              Validate code
            </button>
          </form>
        </div>
      )}
      {showVendorDialog && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40">
          <dialog id="vendorDialog" open className="rounded shadow-md p-6 bg-white max-w-md w-full mt-16 mx-auto">
            <form
              method="dialog"
              className="flex flex-col gap-4 w-full"
              onSubmit={(e) => {
                e.preventDefault();
                setShowVendorDialog(false);
                // Optionally, handle vendor creation logic here
              }}
            >
              <h2 className="text-lg font-semibold mb-2">Create Vendor Account</h2>
              <p>This information is used by your peers to contact you for collaborative activities. Please add accurate information and accounts that you frequently check.</p>
              <label className="flex flex-col">
                Name
                <input type="text" name="name" required className="border border-gray-300 rounded px-3 py-2 mt-1" placeholder="Your real name" />
              </label>
              <label className="flex flex-col">
                Email
                <input type="email" name="email" required className="border border-gray-300 rounded px-3 py-2 mt-1" placeholder="Email that you frequently check" />
              </label>
              <label className="flex flex-col">
                Phone Number
                <input type="tel" name="phone" required className="border border-gray-300 rounded px-3 py-2 mt-1" placeholder="Phone number you will respond to" />
              </label>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700">
                  Submit
                </button>
                <button type="button" onClick={() => setShowVendorDialog(false)} className="bg-gray-300 rounded px-4 py-2 font-semibold hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </form>
          </dialog>
        </div>
      )}
    </div>
  );
}

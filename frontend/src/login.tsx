import React from 'react';

import service from './service';
import { Vendor } from './model';

export default function Login({ setVendor }) {
  const [netId, setNetId] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [inputValue, setInputValue] = React.useState<string>('');
  const [vendorDialogVisible, setVendorDialogVisible] = React.useState(false);

  const submitCodeRequest = async (e) => {
    e.preventDefault();

    const vendorExists = await service.vendorExists(inputValue);
    if (vendorExists) {
      await requestCode(inputValue);
    } else {
      setVendorDialogVisible(true);
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

  async function createVendor(vendor: Vendor) {
    const addedVendor = await service.addVendor({ ...vendor, id: inputValue });
    await requestCode(addedVendor.id);
    setVendorDialogVisible(false);
  }

  async function requestCode(id: string) {
    try {
      setEmail(await service.requestCode(id));
      setNetId(id);
      setInputValue('');
    } catch (error) {
      alert(`Unable to process login requests. ${error.message || 'An unexpected error occurred.'}`);
    }
  }

  return (
    <div>
      {!netId ? (
        <div className="flex items-start justify-center">
          <form onSubmit={submitCodeRequest} className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-80 my-6">
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
              Provide the code sent to <b>{email}</b>.
            </div>
            <input id="login" type="text" value={inputValue} placeholder="Code" onChange={(e) => setInputValue(e.target.value)} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button disabled={!inputValue} type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
              Validate code
            </button>
          </form>
        </div>
      )}
      {vendorDialogVisible && <VendorDialog setShowVendorDialog={setVendorDialogVisible} createVendor={createVendor} />}
    </div>
  );
}

function VendorDialog({ setShowVendorDialog, createVendor }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      <dialog id="vendorDialog" open className="rounded shadow-md p-6 bg-white max-w-md w-full mt-16 mx-auto">
        <form
          method="dialog"
          className="flex flex-col gap-4 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailPattern.test(email)) {
              alert('Please enter a valid email address of the form xxx@xxx.xxx');
              return;
            }
            const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
            if (!phonePattern.test(phone)) {
              alert('Please enter a valid phone number of the form xxx-xxx-xxxx');
              return;
            }
            createVendor({ name, email, phone });
          }}
        >
          <h2 className="text-lg font-semibold mb-2">Create Vendor Account</h2>
          <p className="text-sm">This information is used by your peers to contact you for collaborative activities. Please add accurate information for accounts that you frequently check.</p>
          <label className="flex flex-col">
            Name
            <input type="text" name="name" required onChange={(e) => setName(e.target.value)} className="border border-gray-300 rounded px-3 py-2 mt-1 font-normal" placeholder="Your real name" />
          </label>
          <label className="flex flex-col">
            Email <span className="text-sm italic text-gray-300">That you check frequently</span>
            <input type="email" name="email" required onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 rounded px-3 py-2 mt-1" placeholder="xxxx@xxx.xxx" />
          </label>
          <label className="flex flex-col">
            Phone Number <span className="text-sm italic text-gray-300">For text notifications</span>
            <input type="tel" name="phone" required onChange={(e) => setPhone(e.target.value)} className="border border-gray-300 rounded px-3 py-2 mt-1" placeholder="xxx-xxx-xxxx" />
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
  );
}

import React from 'react';
import service from './service';
import { Vendor } from './model';
import PenetrationTesting from './penetrationTesting';
import Chaos from './chaos';

interface DashboardProps {
  vendor: Vendor;
  setVendor: (vendor: Vendor) => void;
}

const Dashboard = ({ vendor, setVendor }: DashboardProps): JSX.Element => {
  const [vendorChanged, setVendorChanged] = React.useState(false);
  const [gitHubUrl, setGitHubUrl] = React.useState(vendor.gitHubUrl || '');
  const [name, setName] = React.useState(vendor.name || '');
  const [phone, setPhone] = React.useState(vendor.phone || '');
  const [email, setEmail] = React.useState(vendor.email || '');
  const [website, setWebsite] = React.useState(vendor.website || '');
  const [badgeName, setBadgeName] = React.useState('');
  const [badgeUrl, setBadgeUrl] = React.useState('');

  async function updateVendorProp(value: string, fn: React.Dispatch<React.SetStateAction<string>>) {
    fn(value);
    vendorChanged || setVendorChanged(true);
  }

  async function updateVendor(): Promise<void> {
    if (vendorChanged) {
      const fields = { email, gitHubUrl, name, phone, website };
      const updatedFields = Object.fromEntries(Object.entries(fields).filter(([key, value]) => value && value !== vendor[key]));
      const vendorUpdate = await service.updateVendor({ ...updatedFields, id: vendor.id });
      if (vendorUpdate) {
        setVendor(vendorUpdate);
        setVendorChanged(false);
      }
    }
  }

  function validateBadgeName(e: React.ChangeEvent<HTMLInputElement>): void {
    const value: string = e.target.value;
    const regex: RegExp = /^[a-zA-Z\-]{1,32}$/;
    if (regex.test(value) || value === '') {
      setBadgeName(value);
    } else {
      e.target.value = badgeName;
    }
  }

  async function generateBadge(): Promise<void> {
    const badgeUrl = await service.generateBadge(vendor.id, badgeName);
    setBadgeUrl(badgeUrl);
  }
  const [debug, setDebug] = React.useState(false);

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-start text-gray-800">
        Pizza <span onClick={() => setDebug(!debug)}>Vendor</span> Dashboard
      </h2>
      <div className="flex items-center">
        <span className="font-semibold text-gray-700 min-w-max mr-2">Net ID:</span>
        <span className="text-gray-900">{vendor.id}</span>
      </div>
      <div className="flex items-center">
        <span className="font-semibold text-gray-700 min-w-max mr-2">Application Key:</span>
        <span className="text-gray-900 truncate">{vendor.apiKey}</span>
        <button className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 focus:bg-orange-100 text-xs " onClick={() => navigator.clipboard.writeText(vendor.apiKey || '')} title="Copy API Key">
          Copy
        </button>
      </div>
      <div className="mt-6 p-4 border border-gray-300">
        <div className="grid grid-cols-[max-content_1fr] gap-2 items-center mb-4">
          <label htmlFor="vendorName" className="font-semibold text-gray-700">
            Name:
          </label>
          <input id="vendorName" type="text" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="Your name" value={name} onChange={(e) => updateVendorProp(e.target.value, setName)} />

          <label htmlFor="vendorPhone" className="font-semibold text-gray-700">
            Phone:
          </label>
          <input id="vendorPhone" type="phone" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="Your phone" value={phone} onChange={(e) => updateVendorProp(e.target.value, setPhone)} />

          <label htmlFor="vendorEmail" className="font-semibold text-gray-700">
            Email:
          </label>
          <input id="vendorEmail" type="email" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="Your email" value={email} onChange={(e) => updateVendorProp(e.target.value, setEmail)} />

          <label htmlFor="website" className="font-semibold text-gray-700">
            Pizza Website:
          </label>
          <input id="website" type="url" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="https://pizza.yourdomain" value={website} onChange={(e) => updateVendorProp(e.target.value, setWebsite)} />

          <label htmlFor="gitHubUrl" className="font-semibold text-gray-700">
            GitHub URL:
          </label>
          <input id="gitHubUrl" type="url" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="https://github.com/your-repo" value={gitHubUrl} onChange={(e) => updateVendorProp(e.target.value, setGitHubUrl)} />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!vendorChanged} onClick={() => updateVendor()}>
          Update
        </button>
      </div>
      <Chaos vendor={vendor} />
      <PenetrationTesting vendor={vendor} setVendor={setVendor} />
      <div className="mt-6 p-4 border border-gray-300">
        <div className="mb-4 flex items-center">
          <label htmlFor="badgeName" className="mr-2 font-semibold text-gray-700">
            Badge Name:
          </label>
          <input id="badgeName" type="text" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full flex-1" placeholder="alphabetic single world only" value={badgeName} onChange={(e) => validateBadgeName(e)} />
        </div>
        <div className="mb-4 flex items-center">
          <span className="mr-2 font-semibold text-gray-700">URL:</span>
          <span id="badgeUrl" className="text-gray-900">
            {badgeUrl ? <a href={badgeUrl}>{badgeUrl}</a> : 'Not generated yet'}
          </span>
        </div>
        <div className="mb-4 flex items-center">
          <span className="mr-2 font-semibold text-gray-700">Image:</span>
          <span id="badgeImage" className="text-gray-900">
            {badgeUrl && <img security="true" src={badgeUrl} alt="Badge" />}
          </span>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!badgeName} onClick={generateBadge}>
          Generate Badge
        </button>
      </div>
      <pre className={`${debug ? '' : 'hidden'} mt-6 bg-gray-100 p-2 rounded text-xs overflow-x-auto`}>{JSON.stringify(vendor, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;

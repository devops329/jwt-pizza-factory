import React from 'react';
import service from './service';
import { Vendor } from './model';
import PenetrationTesting from './penetrationTesting';
import Chaos from './chaos';
import Badge from './badge';

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
      <Badge vendor={vendor} />
      <pre className={`${debug ? '' : 'hidden'} mt-6 bg-gray-100 p-2 rounded text-xs overflow-x-auto`}>{JSON.stringify(vendor, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;

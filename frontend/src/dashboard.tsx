import React from 'react';
import { Vendor } from './model';
import PenetrationTesting from './penetrationTesting';
import Chaos from './chaos';
import Badge from './badge';
import VendorDetails from './vendorDetails';

interface DashboardProps {
  vendor: Vendor;
  setVendor: (vendor: Vendor) => void;
}

const Dashboard = ({ vendor, setVendor }: DashboardProps): JSX.Element => {
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
      <VendorDetails vendor={vendor} setVendor={setVendor} />
      <Chaos vendor={vendor} />
      <PenetrationTesting vendor={vendor} setVendor={setVendor} />
      <Badge vendor={vendor} />
      <pre className={`${debug ? '' : 'hidden'} mt-6 bg-gray-100 p-2 rounded text-xs overflow-x-auto`}>{JSON.stringify(vendor, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import service from './service';
import { Vendor } from './model';

interface VendorDetailsProps {
  vendor: Vendor;
  setVendor: (vendor: Vendor) => void;
}

function VendorDetails({ vendor, setVendor }: VendorDetailsProps): JSX.Element {
  const [vendorState, setVendorState] = React.useState<Vendor>(vendor);
  const [vendorChanged, setVendorChanged] = React.useState(false);

  React.useEffect(() => {
    setVendorState(vendor);
    setVendorChanged(false);
  }, [vendor]);

  function updateVendorProp<K extends keyof Vendor>(key: K, value: Vendor[K]) {
    setVendorState((prev) => ({ ...prev, [key]: value }));
    setVendorChanged(true);
  }

  async function updateVendor(): Promise<void> {
    if (vendorChanged) {
      const updatedFields = Object.fromEntries(Object.entries(vendorState).filter(([key, value]) => value !== vendor[key as keyof Vendor]));
      const vendorUpdate = await service.updateVendor({ ...updatedFields, id: vendor.id });
      if (vendorUpdate) {
        setVendor(vendorUpdate);
        setVendorChanged(false);
      }
    }
  }

  return (
    <div className="mt-6 p-4 border border-gray-300">
      <div className="grid grid-cols-[max-content_1fr] gap-2 items-center mb-4">
        <div className="font-semibold text-gray-700 min-w-max mr-2">Net ID:</div>
        <label htmlFor="netId">
          <div id="netId" className="text-gray-900">
            {vendor.id}
          </div>
        </label>

        <div className="font-semibold text-gray-700 min-w-max mr-2">API Key:</div>
        <div>
          <span className="text-gray-900 truncate">{vendor.apiKey}</span>
          <button className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 focus:bg-orange-100 text-xs " onClick={() => navigator.clipboard.writeText(vendor.apiKey || '')} title="Copy API Key">
            Copy
          </button>
        </div>

        <label htmlFor="vendorName" className="font-semibold text-gray-700">
          Name:
        </label>
        <input id="vendorName" type="text" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="Your name" value={vendorState.name || ''} onChange={(e) => updateVendorProp('name', e.target.value)} />

        <label htmlFor="vendorPhone" className="font-semibold text-gray-700">
          Phone:
        </label>
        <input id="vendorPhone" type="phone" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="Your phone" value={vendorState.phone || ''} onChange={(e) => updateVendorProp('phone', e.target.value)} />

        <label htmlFor="vendorEmail" className="font-semibold text-gray-700">
          Email:
        </label>
        <input id="vendorEmail" type="email" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="Your email" value={vendorState.email || ''} onChange={(e) => updateVendorProp('email', e.target.value)} />

        <a href={vendorState.website || undefined} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-700">
          <label htmlFor="website" className="hover:underline">
            Pizza Website:
          </label>
        </a>
        <input id="website" type="url" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="https://pizza-service.yourdomain" value={vendorState.website || ''} onChange={(e) => updateVendorProp('website', e.target.value)} />

        <a href={vendorState.gitHubUrl || undefined} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-700">
          <label htmlFor="gitHubUrl" className="hover:underline">
            GitHub URL:
          </label>
        </a>
        <input id="gitHubUrl" type="url" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="https://github.com/your-repo" value={vendorState.gitHubUrl || ''} onChange={(e) => updateVendorProp('gitHubUrl', e.target.value)} />
      </div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!vendorChanged} onClick={() => updateVendor()}>
        Update
      </button>
    </div>
  );
}

export default VendorDetails;

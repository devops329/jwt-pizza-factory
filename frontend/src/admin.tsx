import React from 'react';
import { Vendor } from './model';
import service from './service';
import VendorDetails from './vendorDetails';

interface AdminProps {
  vendor: Vendor;
}

function Admin({ vendor }: AdminProps) {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = React.useState<Vendor | null>(vendor);
  const [filteredVendors, setFilteredVendors] = React.useState<Vendor[]>([]);

  React.useEffect(() => {
    (async () => {
      const vendors = await service.getVendors();
      setVendors(vendors);
      setFilteredVendors(vendors);
      setSelectedVendor(vendors.length > 0 ? vendors[0] : null);
    })();
  }, []);

  function setFilter(filter: string) {
    const result = vendors.filter((v) => v.name?.toLowerCase().includes(filter) || v.id?.toLowerCase().includes(filter));
    setFilteredVendors(result);
    setSelectedVendor(result.length > 0 ? result[0] : null);
  }

  async function updateVendorRole(vendor: Vendor, isAdmin: boolean) {
    if (vendor) {
      const roles = isAdmin ? ['admin'] : ['vendor'];
      const updatedVendor = await service.updateVendorRoles(vendor, roles);
      if (updatedVendor) {
        setSelectedVendor(updatedVendor);
        setVendors((prev) => prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)));
        setFilteredVendors((prev) => prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)));
      }
    }
  }

  return (
    <div className="mt-6 p-4 border border-gray-300 bg-gray-50 rounded">
      <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
      <p className="text-sm text-gray-600">As an admin, you can manage vendors, view logs, and perform other administrative tasks.</p>
      <div className="mt-4">
        <input type="text" placeholder="Filter by name or id..." className="border px-2 py-1 rounded mb-2 w-full" onChange={(e) => setFilter(e.target.value.toLowerCase())} />
        <select
          className="border px-2 py-1 rounded w-full"
          value={selectedVendor?.id || ''}
          onChange={(e) => {
            const selected = vendors.find((v) => v.id === e.target.value);
            setSelectedVendor(selected || null);
          }}
        >
          {filteredVendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name} ({vendor.id})
            </option>
          ))}
        </select>
        <div>
          {selectedVendor ? (
            <div>
              <pre className={`mt-6 bg-gray-100 p-2 rounded text-xs overflow-x-auto`}>{JSON.stringify(selectedVendor, null, 2)}</pre>

              <div className="my-4 text-gray-500">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={selectedVendor?.roles?.includes('admin') || false} onChange={async (e) => updateVendorRole(selectedVendor, e.target.checked)} className="form-checkbox" />
                  <span>Admin</span>
                </label>
              </div>
              <VendorDetails
                vendor={selectedVendor}
                setVendor={(vendor) => {
                  setVendors((prev) => prev.map((v) => (v.id === vendor.id ? { ...v, ...vendor } : v)));
                  setFilteredVendors((prev) => prev.map((v) => (v.id === vendor.id ? { ...v, ...vendor } : v)));
                  setSelectedVendor(vendor);
                }}
              />
            </div>
          ) : (
            <div className="mt-4 text-gray-500">No vendor selected.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;

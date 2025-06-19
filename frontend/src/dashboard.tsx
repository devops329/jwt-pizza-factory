import React from 'react';
import { Vendor } from './model';
import PenetrationTesting from './penetrationTesting';
import Chaos from './chaos';
import Badge from './badge';
import VendorDetails from './vendorDetails';
import Admin from './admin';

interface DashboardProps {
  vendor: Vendor;
  setVendor: (vendor: Vendor) => void;
}

const Dashboard = ({ vendor, setVendor }: DashboardProps): JSX.Element => {
  const [debug, setDebug] = React.useState(false);

  const role = vendor.roles?.includes('admin') ? 'Admin' : 'Vendor';

  return (
    <div className='p-8 bg-white rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-6 text-start text-gray-800'>
        Pizza <span onClick={() => setDebug(!debug)}>{role}</span> Dashboard
      </h2>

      {role === 'Admin' && <Admin vendor={vendor} />}
      {role === 'Vendor' && (
        <div>
          <VendorDetails vendor={vendor} setVendor={setVendor} />
          <Chaos vendor={vendor} />
          <PenetrationTesting vendor={vendor} setVendor={setVendor} />
          <Badge vendor={vendor} />
        </div>
      )}
      <pre className={`${debug ? '' : 'hidden'} mt-6 bg-gray-100 p-2 rounded text-xs overflow-x-auto`}>{JSON.stringify(vendor, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;

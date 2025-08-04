import React from 'react';
import service from './service';
import { Vendor } from './model';

interface PenetrationTestingProps {
  vendor: Vendor;
  setVendor: (vendor: Vendor) => void;
}

function PenetrationTesting({ vendor, setVendor }: PenetrationTestingProps): JSX.Element {
  function requestEnabled() {
    if (vendor.name && vendor.website && vendor.phone && vendor.email && vendor.gitHubUrl) {
      if (!vendor.connections?.penetrationTest) {
        return true;
      }
    }
    return false;
  }

  async function requestPenetrationTestPartner(): Promise<void> {
    const connectedVendor = await service.connectVendor('penetrationTest');
    setVendor(connectedVendor);
  }

  let connectionJsx = <span className="text-gray-900">Not yet requested</span>;
  const penetrationTest = vendor.connections?.penetrationTest;
  if (penetrationTest) {
    if (penetrationTest.id) {
      connectionJsx = (
        <div>
          <div className="text-gray-600">{penetrationTest.name}</div>
          <a href={penetrationTest.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            {penetrationTest.website}
          </a>
          <div className="text-gray-600">{penetrationTest.phone}</div>
          <div className="text-gray-600">{penetrationTest.email}</div>
          {penetrationTest && penetrationTest.id && (
            <div className="flex items-center mt-2">
              <span className="mr-2 text-gray-700">Rate partner: </span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-2xl focus:outline-none ${penetrationTest.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={async () => {
                    penetrationTest.rating = star;
                    service.updateVendor({
                      id: vendor.id,
                      connections: vendor.connections,
                    });
                    setVendor({ ...vendor });
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      connectionJsx = <span>Waiting for available partner</span>;
    }
  }

  return (
    <div className="mt-6 p-4 border border-gray-300">
      <div className="flex flex-col mb-4">
        <div className="mr-2 font-semibold text-gray-700">Pentest partner:</div>
        {connectionJsx}
      </div>
      {!penetrationTest && (
        <div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 transition" disabled={!requestEnabled()} onClick={requestPenetrationTestPartner}>
            Request partner
          </button>
          {!requestEnabled() && <div className="text-sm italic m-3">Note: You must provide all vendor information and have your pizza website available before requesting a partner.</div>}
        </div>
      )}
    </div>
  );
}

export default PenetrationTesting;

import React from 'react';
import service from './service';
import { Vendor } from './model';

interface ChaosProps {
  vendor: Vendor;
}

function Chaos({ vendor }: ChaosProps): JSX.Element {
  const [chaosState, setChaosState] = React.useState(getChaosLabel(vendor));

  function chaosAvailable() {
    if (vendor.name && vendor.website && vendor.phone && vendor.email && vendor.gitHubUrl) {
      if (chaosState === 'calm') {
        return true;
      }
    }
    return false;
  }

  function getChaosLabel(vendor: Vendor): string {
    return !vendor || !vendor.chaos || vendor.chaos.type === 'none' ? 'calm' : 'chaotic';
  }

  async function initiateChaos(): Promise<void> {
    const chaosResponse = await service.initiateChaos();
    if (chaosResponse.success) {
      setChaosState('chaotic');
    } else {
      alert(`Chaos initiation failed: ${chaosResponse.message}`);
    }
  }

  return (
    <div className="mt-6 p-4 border border-gray-300">
      <div className="flex items-center mb-4">
        <span className="mr-2 font-semibold text-gray-700">Chaos status:</span>
        <span id="chaosStatus" className="text-gray-900">
          {chaosState}
        </span>
      </div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!chaosAvailable()} onClick={initiateChaos}>
        Initiate chaos
      </button>
      <div className="text-sm italic m-3">Note: You must provide all vendor information and have your pizza website available before requesting chaos.</div>
    </div>
  );
}

export default Chaos;

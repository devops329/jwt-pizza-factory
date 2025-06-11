import React from 'react';
import service from './service';

const Dashboard = ({ vendor, setVendor }) => {
  const [gitHubUrl, setGitHubUrl] = React.useState(vendor.gitHubUrl || '');
  const [website, setWebsite] = React.useState(vendor.website || '');
  const [badgeName, setBadgeName] = React.useState('');
  const [badgeUrl, setBadgeUrl] = React.useState('');
  const [chaosState, setChaosState] = React.useState('calm');

  function updateVendor(key, value) {
    const vendorUpdate = { ...vendor, [key]: value };
    service.updateVendor(vendorUpdate);
    setVendor(vendorUpdate);
  }

  function validateBadgeName(e) {
    const value = e.target.value;
    const regex = /^[a-zA-Z\-]{1,32}$/;
    if (regex.test(value) || value === '') {
      setBadgeName(value);
    } else {
      e.target.value = badgeName;
    }
  }

  async function generateBadge() {
    const badgeUrl = await service.generateBadge(vendor.id, badgeName);
    setBadgeUrl(badgeUrl);
  }

  function initiateChaos() {
    setChaosState('chaotic');
  }

  const chaosStatusElement = document.getElementById('chaosStatus');
  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-start text-gray-800">Pizza Vendor Dashboard</h2>
      <div className="flex items-center">
        <span className="font-semibold text-gray-700 w-40">Net ID:</span>
        <span className="text-gray-900">{vendor.id}</span>
      </div>
      <div className="flex items-center">
        <span className="font-semibold text-gray-700 w-40">Application Key:</span>
        <span className="text-gray-900">{vendor.apiKey}</span>
      </div>
      <div className="mt-6 p-4 border border-gray-300">
        <div className="mb-4 flex items-center">
          <label htmlFor="website" className="mr-2 font-semibold text-gray-700">
            Pizza Website:
          </label>
          <input id="website" type="url" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full flex-1" placeholder="https://pizza.yourdomain" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!isValidUrl(website)} onClick={() => updateVendor('webSite', website)}>
          Update
        </button>
      </div>
      <div className="mt-6 p-4 border border-gray-300">
        <div className="mb-4 flex items-center">
          <label htmlFor="gitHubUrl" className="mr-2 font-semibold text-gray-700">
            GitHub URL:
          </label>
          <input id="gitHubUrl" type="url" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full flex-1" placeholder="https://github.com/your-repo" value={gitHubUrl} onChange={(e) => setGitHubUrl(e.target.value)} />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!isValidUrl(gitHubUrl)} onClick={() => updateVendor('gitHubUrl', gitHubUrl)}>
          Update
        </button>
      </div>
      <div className="mt-6 p-4 border border-gray-300">
        <div className="flex items-center mb-4">
          <span className="mr-2 font-semibold text-gray-700">Chaos status:</span>
          <span id="chaosStatus" className="text-gray-900">
            {chaosState}
          </span>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={chaosState !== 'calm'} onClick={initiateChaos}>
          Initiate chaos
        </button>
      </div>
      <div className="mt-6 p-4 border border-gray-300">
        <div className="flex items-center mb-4">
          <span className="mr-2 font-semibold text-gray-700">Pentest partner:</span>
          <span id="penTestPartner" className="text-gray-900">
            not requested
          </span>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => {
            alert('This feature is not implemented yet.');
          }}
        >
          Request partner
        </button>
      </div>
      <div className="mt-6 p-4 border border-gray-300">
        <div className="mb-4 flex items-center">
          <label htmlFor="badgeName" className="mr-2 font-semibold text-gray-700">
            Badge Name:
          </label>
          <input id="badgeName" type="text" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full flex-1" placeholder="alphabetic single world only" value={badgeName} onChange={(e) => validateBadgeName(e)} />
        </div>
        <div className="mb-4 flex items-center">
          <span className="mr-2 font-semibold text-gray-700">Badge URL:</span>
          <span id="badgeUrl" className="text-gray-900">
            {badgeUrl || 'Not generated yet'}
            {badgeUrl && <img security="true" src={badgeUrl} alt="Badge" className="ml-6 inline-block" />}
          </span>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!badgeName} onClick={generateBadge}>
          Generate Badge
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

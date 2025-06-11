import React from 'react';
import service from './service';

const Dashboard = ({ vendor, setVendor }) => {
  const [gitHubUrl, setGitHubUrl] = React.useState(vendor.gitHubUrl || 'https://github.com/');

  function updateGitHubUrl() {
    const vendorUpdate = { ...vendor, gitHubUrl };
    service.updateVendor(vendorUpdate);
    setVendor(vendorUpdate);
  }

  function isValidUrl(url) {
    return /^https:\/\/github\.com\/.+/.test(url);
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
      <div className="flex items-center">
        <span className="font-semibold text-gray-700 w-40">GitHub URL:</span>
        <span className="text-gray-900">{vendor.gitHubUrl ?? 'not provided'}</span>
      </div>
      <div className="mt-6 p-4 border border-gray-300">
        <div className="mb-4 flex items-center">
          <label htmlFor="gitHubUrl" className="mr-2 font-semibold text-gray-700">
            GitHub URL:
          </label>
          <input id="gitHubUrl" type="url" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="https://github.com/your-repo" value={gitHubUrl} onChange={(e) => setGitHubUrl(e.target.value)} />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!isValidUrl(gitHubUrl)} onClick={updateGitHubUrl}>
          Update
        </button>
      </div>
      <div className="mt-6 p-4 border border-gray-300">
        <div className="mb-4 flex items-center">
          <label htmlFor="badgeName" className="mr-2 font-semibold text-gray-700">
            Badge Name:
          </label>
          <input
            id="badgeName"
            type="text"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="single word"
            value={vendor.badgeName || ''}
            onChange={(e) => {
              if (typeof vendor.setBadgeName === 'function') {
                vendor.setBadgeName(e.target.value);
              }
            }}
          />
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => {
            const badgeUrl = `${window.location.origin}/badge/${vendor.id}/pizza`;
            navigator.clipboard.writeText(badgeUrl);
            alert(`Badge URL copied to clipboard:\n${badgeUrl}`);
          }}
        >
          Generate Badge
        </button>
      </div>
      <div className="mt-6 p-4 border border-gray-300">
        <div className="flex items-center mb-4">
          <span className="mr-2 font-semibold text-gray-700">Chaos status:</span>
          <span id="chaosStatus" className="text-gray-900">
            peaceful
          </span>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => {
            alert('This feature is not implemented yet.');
          }}
        >
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
    </div>
  );
};

export default Dashboard;

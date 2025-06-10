import React from 'react';

const Dashboard = ({ vendor }) => {
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
        <span className="font-semibold text-gray-700 w-40">Pentest partner:</span>
        <span className="text-gray-900">not requested</span>
      </div>
      <div className="flex items-center">
        <span className="font-semibold text-gray-700 w-40">GitHub URL:</span>
        <span className="text-gray-900">{vendor.gitHubUrl ?? 'not provided'}</span>
      </div>
      <div className="mt-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => {
            const badgeUrl = `https://badges.pizza-factory.com/${vendor.netId}`;
            navigator.clipboard.writeText(badgeUrl);
            alert(`Badge URL copied to clipboard:\n${badgeUrl}`);
          }}
        >
          Generate Badge URL
        </button>
      </div>
      <div className="mt-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => {
            alert('This feature is not implemented yet.');
          }}
        >
          Initiate chaos
        </button>
      </div>
      <div className="mt-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => {
            alert('This feature is not implemented yet.');
          }}
        >
          Request pentest partner
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState } from 'react';

const Dashboard = ({ authToken }) => {
  const [userData, setUserData] = useState({ name: '', netId: '', apiKey: '' });

  React.useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/vendor', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    })();
  });

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-start text-gray-800">Pizza Vendor Dashboard</h2>
      <div className="mb-4 flex items-center">
        <span className="font-semibold text-gray-700 w-40">Net ID:</span>
        <span className="text-gray-900">{userData.netId}</span>
      </div>
      <div className="flex items-center">
        <span className="font-semibold text-gray-700 w-40">Application Key:</span>
        <span className="text-gray-900">{userData.apiKey}</span>
      </div>
      <div className="mt-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => {
            const badgeUrl = `https://badges.pizza-factory.com/${userData.netId}`;
            navigator.clipboard.writeText(badgeUrl);
            alert(`Badge URL copied to clipboard:\n${badgeUrl}`);
          }}
        >
          Generate Badge URL
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

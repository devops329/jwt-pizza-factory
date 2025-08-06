import React from 'react';
import service from './service';
import { Vendor } from './model';

interface BadgeProps {
  vendor: Vendor;
}

function Badge({ vendor }: BadgeProps): JSX.Element {
  const [badgeUrl, setBadgeUrl] = React.useState('');
  const [badgeName, setBadgeName] = React.useState('');
  const [badgeColor, setBadgeColor] = React.useState('#44aa44');
  const [badgeLabel, setBadgeLabel] = React.useState('Example');
  const [badgeValue, setBadgeValue] = React.useState('100%');

  async function generateBadge(): Promise<void> {
    const badgeUrl = await service.generateBadge(vendor.id, badgeName, badgeLabel, badgeValue, badgeColor);
    setBadgeUrl(`${badgeUrl}?t=${Date.now()}`);
  }

  function validateBadgeName(e: React.ChangeEvent<HTMLInputElement>): void {
    const value: string = e.target.value;
    const regex: RegExp = /^[a-zA-Z\-]{1,32}$/;
    if (regex.test(value) || value === '') {
      setBadgeName(value);
    } else {
      e.target.value = badgeName;
    }
  }

  return (
    <div className="mt-6 p-4 border border-gray-300">
      <div className="mb-4 flex items-center">
        <label htmlFor="badgeName" className="mr-2 font-semibold text-gray-700">
          Badge Name:
        </label>
        <input id="badgeName" type="text" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full flex-1" placeholder="alphabetic single world only" value={badgeName} onChange={(e) => validateBadgeName(e)} />
      </div>
      <div className="mb-4 flex items-center">
        <label htmlFor="badgeLabel" className="mr-2 font-semibold text-gray-700">
          Label:
        </label>
        <input id="badgeLabel" type="text" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full flex-1" placeholder="alphabetic single world only" value={badgeLabel} onChange={(e) => setBadgeLabel(e.currentTarget.value)} />
      </div>
      <div className="mb-4 flex items-center">
        <label htmlFor="badgeValue" className="mr-2 font-semibold text-gray-700">
          Value:
        </label>
        <input id="badgeValue" type="text" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full flex-1" placeholder="alphabetic single world only" value={badgeValue} onChange={(e) => setBadgeValue(e.currentTarget.value)} />
      </div>
      <div className="mb-4 flex items-center">
        <label htmlFor="badgeColor" className="mr-2 font-semibold text-gray-700">
          Color:
        </label>
        <input id="badgeColor" type="color" className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="hex color code" value={badgeColor} onChange={(e) => setBadgeColor(e.currentTarget.value)} />
      </div>
      <div className="mb-4 flex items-center">
        <span className="mr-2 font-semibold text-gray-70</div>0">URL:</span>
        <span id="badgeUrl" className="text-gray-900">
          {badgeUrl ? <a href={badgeUrl}>{badgeUrl}</a> : 'Not generated yet'}
        </span>
      </div>
      <div className="mb-4 flex items-center">
        <span className="mr-2 font-semibold text-gray-700">Image:</span>
        <span id="badgeImage" className="text-gray-900">
          {badgeUrl && <img security="true" src={badgeUrl} alt="Badge" />}
        </span>
      </div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!badgeName} onClick={generateBadge}>
        Generate Badge
      </button>
      <div className="text-sm italic m-3">Note: This is only a demonstration. You must generate your badges in your CI pipeline.</div>
    </div>
  );
}

export default Badge;

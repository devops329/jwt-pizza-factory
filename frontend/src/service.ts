const pizzaServiceUrl = import.meta.env.VITE_SERVICE_URL;
import { Vendor } from './model';

class Service {
  async callEndpoint(path: string, method: string = 'GET', body?: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const options: any = {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        };

        const authToken = localStorage.getItem('token');
        if (authToken) {
          options.headers['Authorization'] = `Bearer ${authToken}`;
        }

        if (body) {
          options.body = JSON.stringify(body);
        }

        if (!path.startsWith('http')) {
          path = pizzaServiceUrl + path;
        }

        const r = await fetch(path, options);
        const j = await r.json();
        if (r.ok) {
          resolve(j);
        } else {
          reject({ code: r.status, message: j.message });
        }
      } catch (e: any) {
        reject({ code: 500, message: e.message });
      }
    });
  }

  async vendorExists(netId: string): Promise<boolean> {
    const response = await this.callEndpoint(`/api/vendor/${netId}`);
    return response.exists;
  }

  updateVendor(vendor: Vendor): Promise<Vendor | null> {
    return this.callEndpoint('/api/vendor', 'PUT', vendor);
  }

  getVendor(): Promise<Vendor | null> {
    return this.callEndpoint('/api/vendor');
  }

  async requestCode(netId: string): Promise<void> {
    await this.callEndpoint('/api/vendor/code', 'POST', { id: netId });
  }

  async authenticate(netId: string, code: string): Promise<[Vendor, string] | null> {
    const vendor = await this.callEndpoint('/api/vendor/auth', 'POST', { id: netId, code });
    localStorage.setItem('token', vendor.apiKey);
    return Promise.resolve(vendor);
  }

  async initiateChaos(): Promise<void> {
    await this.callEndpoint(`/api/vendor/chaos/fail`, 'PUT');
  }

  async generateBadge(venderId: string, badgeId: string, label: string = 'Example', value: string = '100%', color: string = '#44aa44'): Promise<string> {
    const query = new URLSearchParams({ label, value, color }).toString();
    const response = await this.callEndpoint(`/api/badge/${venderId}/${badgeId}?${query}`, 'POST');
    return response.url;
  }
}

const service = new Service();
export default service;

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
        let j: any = null;
        const contentType = r.headers.get('content-type');
        if (r.status !== 204 && contentType && contentType.includes('application/json')) {
          j = await r.json();
        }
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

  async addVendor(vendor: Vendor): Promise<Vendor> {
    return this.callEndpoint('/api/vendor', 'POST', vendor);
  }

  async updateVendor(vendor: Vendor): Promise<Vendor | null> {
    return this.callEndpoint('/api/vendor', 'PUT', vendor);
  }

  async updateVendorRoles(vendor: Vendor, roles: string[]): Promise<Vendor | null> {
    return this.callEndpoint('/api/admin/role', 'PUT', { id: vendor.id, roles: roles });
  }

  async deleteVendor(netId: string): Promise<void> {
    return await this.callEndpoint('/api/admin/vendor', 'DELETE', { id: netId, deleteType: 'all' });
  }

  async getVendor(): Promise<Vendor | null> {
    return this.callEndpoint('/api/vendor');
  }

  async getVendors(): Promise<Vendor[]> {
    return this.callEndpoint('/api/admin/vendors');
  }

  async connectVendor(purpose: string): Promise<Vendor> {
    return await this.callEndpoint('/api/vendor/connect', 'POST', { purpose: purpose });
  }

  async updateVendorConnection(connection: any): Promise<Vendor> {
    return await this.callEndpoint('/api/vendor/connect', 'PUT', connection);
  }

  async deleteVendorConnection(netId: string, purpose: string): Promise<Vendor> {
    return await this.callEndpoint('/api/admin/vendor', 'DELETE', { id: netId, deleteType: 'connection', purpose: purpose });
  }

  async requestCode(netId: string): Promise<string> {
    const response = await this.callEndpoint('/api/vendor/code', 'POST', { id: netId });
    return response.email;
  }

  async authenticate(netId: string, code: string): Promise<[Vendor, string] | null> {
    const vendor = await this.callEndpoint('/api/vendor/auth', 'POST', { id: netId, code });
    localStorage.setItem('token', vendor.apiKey);
    return Promise.resolve(vendor);
  }

  async initiateChaos(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.callEndpoint(`/api/vendor/chaos/fail`, 'PUT');
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'An error occurred while initiating chaos.' };
    }
  }

  async cancelChaos(netId: string): Promise<void> {
    return await this.callEndpoint('/api/admin/vendor', 'DELETE', { id: netId, deleteType: 'chaos' });
  }

  async generateBadge(venderId: string, badgeId: string, label: string = 'Example', value: string = '100%', color: string = '#44aa44'): Promise<string> {
    const query = new URLSearchParams({ label, value, color }).toString();
    const response = await this.callEndpoint(`/api/badge/${venderId}/${badgeId}?${query}`, 'POST');
    return response.url;
  }
}

const service = new Service();
export default service;

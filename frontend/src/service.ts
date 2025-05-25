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

  async requestCode(netId: string) {
    await this.callEndpoint('/api/vendor/code', 'POST', { netId });
  }

  async authenticate(code: string): Promise<[Vendor, string]> {
    const { vendor, token } = await this.callEndpoint('/api/vendor/auth', 'POST', { code });
    localStorage.setItem('token', token);
    return Promise.resolve([vendor, token]);
  }
}

const service = new Service();
export default service;

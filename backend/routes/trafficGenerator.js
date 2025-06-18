class TrafficGenerator {
  constructor() {
    this.trafficVendors = {};

    const trafficLoopRef = setInterval(() => {
      const test = async () => {
        for (const vendorId in this.trafficVendors) {
          const vendor = this.trafficVendors[vendorId];
          try {
            if (Math.random() < 0.3) {
              await this.callEndpoint(`${vendor.website}/api/order`, 'POST', vendor.authToken, { franchiseId: 1, storeId: 1, items: [{ menuId: 1, description: 'Veggie', price: 0.05 }] });
            } else if (Math.random() < 0.6) {
              await this.callEndpoint(`${vendor.website}/api/order/menu`);
              await this.callEndpoint(`${vendor.website}/api/order`, 'GET', vendor.authToken);
            }
          } catch (error) {
            // keep trying. They should be in chaos or they might just be down
            console.error(`Error calling endpoint for vendor ${vendor.website}:`, error);
          }
        }
      };
      test();
    }, 10000);
    clearInterval(trafficLoopRef);
  }

  async start(vendor) {
    const vendorTracker = {
      id: vendor.id,
      website: vendor.website,
      name: `user${Math.floor(Math.random() * 100000)}`,
      email: `${Math.floor(Math.random() * 100000)}@chaos.com`,
      password: `pw${Math.floor(Math.random() * 100000)}`,
    };
    if (await this.registerTrafficUser(vendorTracker)) {
      this.trafficVendors[vendor.id] = vendorTracker;
      return true;
    }

    return false;
  }

  stop(vendor) {
    if (this.trafficVendors[vendor.id]) {
      delete this.trafficVendors[vendor.id];
      return true;
    }
    return false;
  }

  async registerTrafficUser(vendor) {
    try {
      const data = await this.callEndpoint(`${vendor.website}/api/auth`, 'POST', null, { name: vendor.name, email: vendor.email, password: vendor.password });
      if (data && data.token) {
        vendor.authToken = data.token;
        return true;
      }
    } catch (error) {}
    return false;
  }

  async callEndpoint(url, method = 'GET', authToken, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const options = {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        };

        if (authToken) {
          options.headers['Authorization'] = `Bearer ${authToken}`;
        }

        if (body) {
          options.body = JSON.stringify(body);
        }

        const r = await fetch(url, options);
        const j = await r.json();
        if (r.ok) {
          resolve(j);
        } else {
          reject({ code: r.status, message: j.message });
        }
      } catch (e) {
        reject({ code: 500, message: e.message });
      }
    });
  }
}

const trafficGenerator = new TrafficGenerator();
module.exports = trafficGenerator;

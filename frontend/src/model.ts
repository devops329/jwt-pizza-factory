type Chaos = {
  type: string;
};

type Vendor = {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  gitHubUrl?: string;
  id: string;
  apiKey?: string;
  chaos?: Chaos;
};

export { Vendor };

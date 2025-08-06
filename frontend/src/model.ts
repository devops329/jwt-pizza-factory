type Chaos = {
  type: string;
  initiatedDate?: string;
  fixDate?: string;
};

type PenetrationTest = {
  id: string;
  name: string;
  website: string;
  phone: string;
  email: string;
  rating: number;
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
  roles?: string[];
  connections?: {
    penetrationTest?: PenetrationTest;
  };
};

export { Vendor };

export interface DatabaseConfig {
  primary: {
    url: string;
    poolSize: number;
    connectionTimeout: number;
  };
  replicas: {
    urls: string[];
    poolSize: number;
    connectionTimeout: number;
  };
  monitoring: {
    slowQueryThreshold: number;
    logQueries: boolean;
    logSlowQueries: boolean;
  };
}

export {};

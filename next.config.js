const nextConfig = {
  "reactStrictMode": true,
  "images": {
    "remotePatterns": [
      {
        "protocol": "https",
        "hostname": "**"
      }
    ]
  },
  "experimental": {
    "serverActions": {
      "bodySizeLimit": "2mb"
    },
    "typedRoutes": true
  },
  "typescript": {
    "ignoreBuildErrors": false,
    "tsconfigPath": "./tsconfig.json"
  },
  "eslint": {
    "ignoreDuringBuilds": true
  },
  "output": "standalone"
};

module.exports = nextConfig;
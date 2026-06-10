import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/tr-iban-generator', destination: '/iban-generator', permanent: true },
      { source: '/fake-person-data', destination: '/', permanent: true },
    ]
  },
};

export default nextConfig;

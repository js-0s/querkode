import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  rewrites: async () => {
    return {
      fallback: [
        {
          source: '/:key*',
          destination: '/api/key/:key*',
        },
      ],
    };
  },
};

export default nextConfig;

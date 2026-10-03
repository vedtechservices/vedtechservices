import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'miaoda-conversation-file.s3cdn.medo.dev' },
    ],
  },
};

export default nextConfig;

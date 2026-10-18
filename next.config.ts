import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/icon.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'miaoda-site-img.s3cdn.medo.dev' },
      { protocol: 'https', hostname: 'miaoda-conversation-file.s3cdn.medo.dev' },
    ],
  },
};

export default nextConfig;

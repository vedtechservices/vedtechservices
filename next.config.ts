import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow isolated verification while a local development server uses .next.
  distDir: process.env.VEDTECH_BUILD_DIR || '.next',
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Restrict parent frames without restricting scripts, forms or child frames.
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Preserve compatibility with authentication and payment popups.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
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

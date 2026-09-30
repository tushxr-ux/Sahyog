/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress assets
  compress: true,

  // Cache static assets for 1 year, pages for 1 hour
  async headers() {
    return [
      {
        source: '/:all*(png|jpg|jpeg|webp|svg|gif|ico|woff2|woff|ttf)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },

  // Enable WebP/AVIF for next/image
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },
};

module.exports = nextConfig;

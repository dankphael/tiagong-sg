/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: "/home/raphael-lee/tiagong-sg",
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true, // ✅ Skip lint errors on Netlify
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
        }/api/:path*`, // ✅ fallback if env var is missing
      },
    ];
  },
};

module.exports = nextConfig;

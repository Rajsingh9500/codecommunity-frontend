/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Prevent Netlify build failures due to ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    // ✅ Use env var for production (Netlify) and fallback for local dev
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

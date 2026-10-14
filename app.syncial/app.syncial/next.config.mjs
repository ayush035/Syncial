/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false, // 🔥 Ignore fs in browser
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;

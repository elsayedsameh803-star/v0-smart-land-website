/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    scrollRestoration: true,
  },
  // Disable Google Font optimization to avoid socket hang up issues
  optimizeFonts: false,
};

export default nextConfig;
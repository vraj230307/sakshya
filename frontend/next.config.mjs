/** @type {import('next').NextConfig} */
const isExport = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  ...(isExport ? { output: 'export' } : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'styles')],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mmtalk.cdn-nhncommerce.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

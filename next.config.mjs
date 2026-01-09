import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'styles')],
    prependData: `@import "variables"; @import "mixins";`,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cdn-nhncommerce.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

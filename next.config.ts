import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack(config, { isServer }) {
    if (process.env.NODE_ENV === 'development' && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        // Don't watch the genkit dev file.
        // This is only used for the genkit dev server.
        // This prevents the nextjs dev server from restarting when the genkit dev server starts.
        ignored: ['**/src/ai/dev.ts'],
      };
    }
    return config;
  }
};

export default nextConfig;

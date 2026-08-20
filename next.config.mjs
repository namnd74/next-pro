const isGithubActions = process.env.GITHUB_ACTIONS || false;
let basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
let assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/` : '';

if (isGithubActions && !basePath) {
  const repo = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
  if (repo && !repo.endsWith('.github.io')) {
    basePath = `/${repo}`;
    assetPrefix = `/${repo}/`;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: basePath || undefined,
  assetPrefix: assetPrefix || undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

// GitHub Pages serves a user site (username.github.io) from "/" and a project
// site (username.github.io/repo) from "/repo". The deploy workflow passes the
// right prefix in NEXT_PUBLIC_BASE_PATH; locally it is empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;

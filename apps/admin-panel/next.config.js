/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@omnigo/api'],
  serverExternalPackages: ['@supabase/supabase-js'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

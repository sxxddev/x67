// next.config.mjs
var nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  },
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/client-runtime-utils",
    "@prisma/adapter-mariadb"
  ]
};
var next_config_default = nextConfig;
export {
  next_config_default as default
};

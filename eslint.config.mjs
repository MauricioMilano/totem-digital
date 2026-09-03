/** @type {import('eslint').FlatConfig.Config[]} */
const nextConfig = (await import("eslint-config-next")).default;

export default [
  ...Array.isArray(nextConfig) ? nextConfig : [nextConfig],
];

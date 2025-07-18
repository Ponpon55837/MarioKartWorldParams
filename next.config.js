/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生產環境優化
  poweredByHeader: false,
  reactStrictMode: true,
  
  // 編譯器優化
  compiler: {
    // 在生產環境移除 console.log，但保留 error 和 warn
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  
  // 圖片優化配置
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生產環境優化
  poweredByHeader: false,
  reactStrictMode: true,

  // 編譯器優化
  compiler: {
    // 在生產環境移除 console.log，但保留 error 和 warn
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false
  },

  // 圖片優化配置
  images: {
    formats: ['image/webp', 'image/avif']
  },

  // HTTP 安全 Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 防止 XSS 攻擊（現代瀏覽器已棄用，但保留舊版相容性）
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // 防止 MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // 防止 Clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // 控制 Referrer 資訊洩漏
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // 限制瀏覽器功能存取
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy：限制資源來源，防止 XSS 與資料注入
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

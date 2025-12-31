import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Strict Modeを有効化（開発時のバグ検出に有効）
  reactStrictMode: true,

  // セキュリティ: X-Powered-Byヘッダーを削除
  poweredByHeader: false,

  // 画像最適化設定
  images: {
    // Google OAuthのプロフィール画像を許可
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
    // 画像フォーマットの最適化
    formats: ["image/avif", "image/webp"],
  },

  // TypeScript設定
  typescript: {
    // 本番ビルド時に型エラーを無視しない
    ignoreBuildErrors: false,
  },

  // 本番環境でのソースマップ生成（デバッグ用、必要に応じて無効化可能）
  productionBrowserSourceMaps: false,

  // 圧縮を有効化
  compress: true,

  // バンドル最適化
  experimental: {
    // Server Actionsの最適化（Next.js 16のデフォルト設定）
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // 並列ルート読み込みの最適化
    optimizePackageImports: ["next-auth"],
  },
};

export default nextConfig;

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Node.js環境を使用（firebase-adminはサーバーサイド）
    environment: "node",

    // グローバルAPIを有効化（describe, it, expectをimportなしで使用可能）
    globals: true,

    // セットアップファイルの指定
    setupFiles: ["./test/setup.ts"],

    // テストファイルのパターン
    include: ["**/*.{test,spec}.{ts,tsx}"],
  },

  resolve: {
    // Next.jsのpathエイリアスを解決
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});

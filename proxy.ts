//Auth.js　https://authjs.dev/getting-started/installation
//セッションを維持するためのオプションのミドルウェアを追加します。
//これにより、呼び出されるたびにセッションの有効期限が更新されます。
//Next.js 15から middleware.ts の名前がproxy.tsに変更されました。

export { auth as middleware } from "@/lib/auth"
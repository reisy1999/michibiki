//Auth.js　https://authjs.dev/getting-started/installation
//セッションを維持するためのオプションのミドルウェアを追加します。
//これにより、呼び出されるたびにセッションの有効期限が更新されます。

export { auth as middleware } from "@/lib/auth"
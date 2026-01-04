// Session と JWT に id プロパティを追加
// auth.ts で account.providerAccountId を token.id と session.user.id に渡すために必要
// モジュール拡張（Module Augmentation）が公式推奨
// 参考: https://authjs.dev/getting-started/typescript#module-augmentation

import { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}
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

/**
 * ⚠️ NextAuth v5 beta の既知の問題
 * 
 * next-auth/jwt は内部で @auth/core/jwt を re-export しているため、
 * declare module "next-auth/jwt" による型拡張が効かない。
 * 
 * 現状の対処: auth.ts で token.id as string を使用
 * TODO: v5 正式リリース後に再確認
 * 
 * 参考: node_modules/next-auth/jwt.d.ts
 */

export {}
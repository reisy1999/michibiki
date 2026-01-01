// User, Session,JWT　それぞれに id プロパティを追加
// モジュール拡張（Module Augmentation）が公式推奨
// 参考: https://authjs.dev/getting-started/typescript#module-augmentation

import NextAuth, { type DefaultUser, type DefaultSession } from "next-auth"
import { type JWT } from "next-auth/jwt"

declare module "next-auth" {
   //DefaultUserでは id?:string
  interface User extends DefaultUser {
    id: string
  }

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
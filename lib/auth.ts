//Auth.js　https://authjs.dev/getting-started/installation
//google用のOAuth https://authjs.dev/getting-started/authentication/oauth

import "@/types/auth"
import NextAuth, { type DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserDocument } from "@/types/firestore"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
    //  By default, the `id` property does not exist on `token` or `session`. See the [TypeScript](https://authjs.dev/getting-started/typescript) on how to add it.
  callbacks: {
    jwt({ token, account }) {
      if (account && account.providerAccountId) {
        // GoogleのユーザーID（sub）を使用
        token.id = account.providerAccountId
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      return session
    },

    // firestoreへの自動ログイン実装
    async signIn({ user, account }) {
      const userId = account?.providerAccountId

      if(userId && user.email) {
        try {
          const userRef = doc(db, "users", userId)
          const userSnap = await getDoc(userRef)

          // 初ログインなら登録
          if(!userSnap.exists()){
            const newUser: UserDocument = {
              email: user.email,
              createdAt: new Date().toISOString(),
            }
            await setDoc(userRef, newUser)
          }
        } catch (error) {
          console.error("Failed to register user in Firestore:", error)
          // Firestore失敗でもログインは成功させる
        }
      }
      return true
    },    
  },
})
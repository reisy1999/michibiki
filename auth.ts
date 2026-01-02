//Auth.js　https://authjs.dev/getting-started/installation
//google用のOAuth https://authjs.dev/getting-started/authentication/oauth

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
    //  By default, the `id` property does not exist on `token` or `session`. See the [TypeScript](https://authjs.dev/getting-started/typescript) on how to add it.
  callbacks: {
    jwt({ token, user }) {
      if (user) { // User is available during sign-in
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      return session
    },

    // firestoreへの自動ログイン実装
    async signIn({ user }) {
      if(user.id && user.email) {
        const userRef = doc(db, "users", user.id)
        const userSnap = await getDoc(userRef)
        
        // 初ログインなら登録
        if(!userSnap.exists()){
          await setDoc(userRef, {
            email: user.email,
            createdAt: new Date().toISOString(),
          })
        }
      }
      return true
    },    
  },
})
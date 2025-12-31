//Auth.js　https://authjs.dev/getting-started/installation

import NextAuth from "next-auth"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [],
})
//サインアウトボタン
//https://authjs.dev/getting-started/session-management/login

import { signOut } from "@/auth"
import { Button } from "@/components/ui/button"
 
export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <button type="submit">Sign Out</button>
    </form>
  )
}
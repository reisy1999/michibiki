//ログイン後最初のページ
import { auth } from "@/auth"
import { SignOut } from "@/app/components/sign-out"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()
  console.log("session:", JSON.stringify(session, null, 2))
  
  // ログインしてなければトップへ
  if (!session) {
    redirect('/')
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{session.user?.name}</h1>
        <h2>
          <ul>
            <li>{session.user?.email}</li>
            <li>{session.user?.image}</li>
            <li>{session.user?.id}</li>
            <li>{session.expires}</li>
          </ul>
        </h2>
        <SignOut />
      </div>
    </div>
  )
}
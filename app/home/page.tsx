//ログイン後最初のページ
import { auth } from "@/auth"
import { SignOut } from "@/app/components/sign-out"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()
  
  // ログインしてなければトップへ
  if (!session) {
    redirect('/')
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">ログイン成功！</h1>
        <SignOut />
      </div>
    </div>
  )
}
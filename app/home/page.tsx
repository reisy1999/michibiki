//ログイン後最初のページ
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()
  
  // ログインしてなければトップへ
  if (!session) {
    redirect('/')
  }
  
  return (
    <div>
      <h2>成功</h2>
    </div>
  )
}
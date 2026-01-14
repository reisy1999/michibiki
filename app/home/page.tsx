//ログイン後最初のページ
import { ScrollArea } from "@/components/ui/scroll-area"
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InputChat } from "@/components/layout/input-chat"

export default async function HomePage() {
  // ログインしてなければトップへ
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="h-screen flex flex-col">
      {/* チャット履歴スクロール可能エリア*/}
      <ScrollArea className="flex-1">
        <div className="flex justify-center">
          <div className="w-full max-w-3xl p-4">
          </div>
        </div>
      </ScrollArea>

      {/* 入力欄 - 画面下部固定、中央配置 */}
      <div className="sticky bottom-2 w-full flex justify-center bg-background">
        <InputChat />
      </div>
    </div>
  )
}
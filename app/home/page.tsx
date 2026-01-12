//ログイン後最初のページ
import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/lib/auth";
import { SignOut } from "@/components/auth/sign-out";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  // ログインしてなければトップへ
  if (!session) {
    redirect("/");
  }
  return (
    <ScrollArea className="flex flex-cal h-screen">
      <div>
        <h1>なにもない！</h1>
      </div>
    </ScrollArea>
  )
}
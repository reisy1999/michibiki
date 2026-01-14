//ログイン後最初のページ
import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/lib/auth";
import { SignOut } from "@/components/auth/sign-out";
import { redirect } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { InputChat } from "@/components/layout/input-chat"

export default async function HomePage() {
  // ログインしてなければトップへ
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <ScrollArea className="flex flex-cal h-screen">
        <InputChat />
    </ScrollArea>
  )
}
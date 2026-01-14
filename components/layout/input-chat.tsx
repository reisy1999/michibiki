"use client"

import { useState } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { 
  InputGroup, 
  InputGroupAddon,
  InputGroupButton 
} from "@/components/ui/input-group"
import { ArrowUpIcon } from "lucide-react"

export function InputChat() {
    const [message, setMessage] = useState("")
    
    const handleSend = () => {
        if (message.trim()) {
            // ここで送信処理
            console.log("送信:", message)
            setMessage("") // 送信後にクリア
        }
    }

    return (
        <InputGroup>
            <TextareaAutosize
                data-slot="input-group-control"
                className="min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
                placeholder="返信..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <InputGroupAddon align="block-end">
                <InputGroupButton
                    variant="outline"
                    className="rounded-full"
                    size="icon-xs"
                    onClick={handleSend}
                >
                    <ArrowUpIcon />
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    )
}
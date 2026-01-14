"use client"

import { useState } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { 
  InputGroup, 
  InputGroupAddon,
  InputGroupButton 
} from "@/components/ui/input-group"
import { ArrowUpIcon } from "lucide-react"

export function InputChat(){
    const [message, setMessage] = useState("")
    
    const handleSend = () => {
        if (message.trim()) {
            // ここで送信処理
            console.log("送信:", message) //本番前に削除
            setMessage("") // 送信後にクリア
        }
    }
    
    // Ctrl+Enterで送信
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && e.ctrlKey && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <InputGroup className="w-full max-w-3xl !ring-0 !border-input">
        {/* どんな状態でもリングエフェクトを0に（CSS !important）*/}
        {/* どんな状態でもボーダー色をグレーに保つ*/}
            <TextareaAutosize
                data-slot="input-group-control"
                className="flex field-sizing-content min-h-10 w-full resize-none rounded-md bg-transparent px-4 py-3 text-base outline-none md:text-sm"
                placeholder="返信..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                minRows={1}
                maxRows={15}
            />
            <InputGroupAddon align="block-end">
                <InputGroupButton
                    variant="default"
                    className="rounded-full ml-auto"
                    size="icon-sm"
                    onClick={handleSend}
                    disabled={!message.trim()}
                >
                    <ArrowUpIcon />
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    )
}
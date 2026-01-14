"use client"

import { useState } from "react"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"

export function InputChat() {
    const [message, setMessage] = useState("")
    const handleSend = () => {
    }

    return (
        <InputGroup>
        <InputGroupTextarea
            placeholder="返信..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
        />
        </InputGroup>
    )
}
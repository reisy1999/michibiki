import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chat } from "@/lib/gemini";
import type { Content } from "@google/genai";

interface ChatRequest {
  contents: Content[];
  systemInstruction?: string;
}

export async function POST(request: NextRequest) {
  try {
    // firebase auth未認証なら401を返す
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディの取得
    const body: ChatRequest = await request.json();
    const { contents, systemInstruction } = body;

    // バリデーション
    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return NextResponse.json(
        { error: "contents is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    // Gemini APIを呼び出し
    const response = await chat(contents, systemInstruction);

    return NextResponse.json({ content: response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

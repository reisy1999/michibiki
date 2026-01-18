import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import type { ConversationDocument } from "@/types/firestore";

/**
 * GET /api/conversations
 * ログインユーザーの会話一覧を取得
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const conversationsSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .orderBy("updatedAt", "desc")
      .get();

    const conversations = conversationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as ConversationDocument),
    }));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * 新規会話を作成
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required and cannot be empty" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newConversation: ConversationDocument = {
      userId,
      title: title.trim(),
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    };

    const docRef = await adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .add(newConversation);

    return NextResponse.json(
      {
        id: docRef.id,
        ...newConversation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

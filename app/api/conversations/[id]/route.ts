// 会話そのもの（title, createdAt, updatedAt, messageCount等のメタデータ）を扱う

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import type { ConversationDocument } from "@/types/firestore";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/conversations/[id]
 * 特定の会話を取得
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    const conversationRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .doc(id);

    const docSnap = await conversationRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "Conversation not found" }, 
        { status: 404 }
      );
    } 

    const conversation = docSnap.data() as ConversationDocument | undefined;

    return NextResponse.json({
      id: docSnap.id,
      ...conversation,
    });
  } catch (error) {
    console.error("GET /api/conversations/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[id]
 * 会話を削除（メッセージも含めて削除）
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    const conversationRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .doc(id);

    const docSnap = await conversationRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "Conversation not found" }, 
        { status: 404 }
      );
    }

    const messagesSnap = await conversationRef.collection("messages").get();

    const batch = adminDb.batch();

    messagesSnap.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    batch.delete(conversationRef);

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/conversations/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

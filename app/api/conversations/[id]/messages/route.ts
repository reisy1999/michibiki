import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import type { MessageDocument, ConversationDocument } from "@/types/firestore";
import type { MessageRole } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface MessageRequest {
  role: MessageRole;
  content: string;
}

/**
 * GET /api/conversations/[id]/messages
 * 特定の会話のメッセージ一覧を取得
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

    const conversationSnap = await conversationRef.get();
    if (!conversationSnap.exists) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const messagesSnap = await conversationRef
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as MessageDocument),
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("GET /api/conversations/[id]/messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]/messages
 * メッセージを追加
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;
    const body: MessageRequest = await request.json();

    const { role, content } = body;
    const validRoles: MessageRole[] = ["user", "model", "system"];

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'user', 'model', or 'system'" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required and cannot be empty" },
        { status: 400 }
      );
    }

    const conversationRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .doc(id);

    const conversationSnap = await conversationRef.get();
    if (!conversationSnap.exists) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    const newMessage: MessageDocument = {
      role,
      content,
      createdAt: now,
    };

    const messageId = await adminDb.runTransaction(async (transaction) => {
      const convSnap = await transaction.get(conversationRef);
      const convData = convSnap.data() as ConversationDocument;

      const messageRef = conversationRef.collection("messages").doc();

      transaction.set(messageRef, newMessage);

      transaction.update(conversationRef, {
        updatedAt: now,
        messageCount: (convData.messageCount || 0) + 1,
      });

      return messageRef.id;
    });

    return NextResponse.json(
      {
        id: messageId,
        ...newMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/conversations/[id]/messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

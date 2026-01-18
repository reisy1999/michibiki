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

    // 会話の存在確認
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

    // TODO: メッセージ一覧を取得する処理を実装してください
    // ヒント:
    // 1. conversationRef.collection("messages") でメッセージコレクション参照
    // 2. .orderBy("createdAt", "asc") で作成日時の昇順にソート（古い順）
    // 3. .get() でクエリを実行
    // 4. snapshot.docs.map() で { id: doc.id, ...doc.data() } 形式に変換

    // ↓↓↓ ここに実装 ↓↓↓
    const messages: (MessageDocument & { id: string })[] = [];
    // ↑↑↑ ここに実装 ↑↑↑

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

    // TODO: リクエストボディのバリデーションを実装してください
    // ヒント:
    // 1. role が "user" | "model" | "system" のいずれかであることを確認
    // 2. content が空文字列でないことを確認
    // 3. バリデーションエラーの場合は400エラーを返す

    // ↓↓↓ ここに実装 ↓↓↓
    const { role, content } = body;
    const validRoles: MessageRole[] = ["user", "model", "system"];

    if (!validRoles.includes(role)) {
      // 400エラーを返す処理を実装
    }

    if (!content || typeof content !== "string") {
      // 400エラーを返す処理を実装
    }
    // ↑↑↑ ここに実装 ↑↑↑

    // 会話の存在確認
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

    // 新規メッセージドキュメント
    const newMessage: MessageDocument = {
      role,
      content,
      createdAt: now,
    };

    // TODO: トランザクションを使ってメッセージ追加と会話更新を実装してください
    // ヒント:
    // トランザクションを使う理由：メッセージ追加とmessageCountの更新を原子的に行うため
    // 1. adminDb.runTransaction(async (transaction) => { ... })
    // 2. transaction.get(conversationRef) で現在の会話データを取得
    // 3. messagesRef = conversationRef.collection("messages").doc() で新規ドキュメント参照
    // 4. transaction.set(messagesRef, newMessage) でメッセージを追加
    // 5. transaction.update(conversationRef, { updatedAt: now, messageCount: 現在のカウント + 1 })
    // 6. トランザクション内でmessagesRef.idを返す

    // ↓↓↓ ここに実装 ↓↓↓
    // 簡易版：トランザクションなしで実装
    const messagesRef = conversationRef.collection("messages");
    const docRef = await messagesRef.add(newMessage);

    // 会話のupdatedAtとmessageCountを更新（本来はトランザクション内で行う）
    const conversationData = conversationSnap.data() as ConversationDocument;
    await conversationRef.update({
      updatedAt: now,
      messageCount: (conversationData.messageCount || 0) + 1,
    });

    const messageId = docRef.id;
    // ↑↑↑ ここに実装 ↑↑↑

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

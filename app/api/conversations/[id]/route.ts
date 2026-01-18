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

    // TODO: Firestoreから特定の会話を取得する処理を実装してください
    // ヒント:
    // 1. adminDb.collection("users").doc(userId).collection("conversations").doc(id) でドキュメント参照
    // 2. .get() でドキュメントを取得
    // 3. docSnap.exists でドキュメントの存在確認
    // 4. 存在しない場合は404エラーを返す
    // 5. docSnap.data() でデータを取得

    // ↓↓↓ ここに実装 ↓↓↓
    const conversationRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .doc(id);

    const docSnap = await conversationRef.get();

    // 存在チェックを実装してください
    // if (!docSnap.exists) { ... }

    const conversation = docSnap.data() as ConversationDocument | undefined;
    // ↑↑↑ ここに実装 ↑↑↑

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

    // TODO: 会話の存在確認を実装してください
    // ヒント:
    // 1. conversationRef.get() でドキュメントを取得
    // 2. 存在しない場合は404エラーを返す

    // ↓↓↓ ここに実装 ↓↓↓

    // ↑↑↑ ここに実装 ↑↑↑

    // TODO: サブコレクション（messages）を削除する処理を実装してください
    // ヒント:
    // Firestoreではサブコレクションは親ドキュメント削除時に自動削除されない
    // 1. conversationRef.collection("messages").get() でメッセージ一覧を取得
    // 2. batch = adminDb.batch() でバッチ処理を開始
    // 3. messagesSnap.docs.forEach(doc => batch.delete(doc.ref)) で各メッセージを削除対象に
    // 4. batch.delete(conversationRef) で会話自体も削除対象に
    // 5. await batch.commit() でバッチ処理を実行

    // ↓↓↓ ここに実装 ↓↓↓
    await conversationRef.delete(); // 簡易版：メッセージ削除は未実装
    // ↑↑↑ ここに実装 ↑↑↑

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/conversations/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

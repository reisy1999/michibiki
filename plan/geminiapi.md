# LLMチャットツール実装計画

## 概要

Gemini APIと連携したチャットツールを実装します。会話履歴をFirestoreに保存し、リアルタイム同期で複数の会話スレッドを管理します。

## 技術スタック

- **LLM**: Gemini API (`@google/generative-ai`)
- **データベース**: Cloud Firestore（リアルタイム同期）
- **認証**: NextAuth.js v5 + Google OAuth（実装済み）
- **フレームワーク**: Next.js 16 App Router

## ユーザー要件

1. ユーザーの入力とLLMからの返答を履歴として保持
2. Gemini API（gemini-2.0-flash-exp相当）と連携
3. Firestoreに会話を保存
4. Firestoreとリアルタイム同期してチャットを表示
5. ChatGPT風の会話スレッド管理（複数会話を切り替え可能）

---

## 実装順序

### Phase 1: データ構造の確立（45分）

#### 1.1 型定義の追加

**ファイル**: `/home/reisy/project/michibiki/types/index.ts`

```typescript
// 既存の型定義の下に追加

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}
```

#### 1.2 Firestore用型定義

**ファイル**: `/home/reisy/project/michibiki/types/firestore.ts`

```typescript
// 既存の UserDocument の下に追加

export interface ConversationDocument {
  userId: string;
  title: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  messageCount: number;
}

export interface MessageDocument {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string; // ISO 8601
}
```

**Firestoreコレクション構造**:

```
conversations/
  {conversationId}/
    - userId, title, createdAt, updatedAt, messageCount
    messages/
      {messageId}/
        - role, content, createdAt
```

---

### Phase 2: バックエンド実装（2時間）

#### 2.1 Gemini APIパッケージのインストール

```bash
npm install @google/generative-ai
```

**環境変数** (`.env.local`):

```
GEMINI_API_KEY=your_api_key_here
```

#### 2.2 Gemini APIラッパー作成

**新規ファイル**: `/home/reisy/project/michibiki/lib/gemini.ts`

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateChatResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  // Gemini形式に変換（'assistant' → 'model'）
  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history: contents.slice(0, -1) });
  const result = await chat.sendMessage(messages[messages.length - 1].content);

  return result.response.text();
}
```

#### 2.3 チャットAPIルート実装

**新規ファイル**: `/home/reisy/project/michibiki/app/api/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { generateChatResponse } from "@/lib/gemini";
import type { MessageDocument, ConversationDocument } from "@/types/firestore";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, message } = await request.json();
  const userId = session.user.id;

  try {
    let convRef;

    if (conversationId) {
      // 既存会話の検証
      convRef = adminDb.collection("conversations").doc(conversationId);
      const convSnap = await convRef.get();
      if (!convSnap.exists || convSnap.data()?.userId !== userId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    } else {
      // 新規会話作成
      convRef = adminDb.collection("conversations").doc();
      const newConv: ConversationDocument = {
        userId,
        title: message.substring(0, 50),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };
      await convRef.set(newConv);
    }

    // ユーザーメッセージを保存
    const userMsg: MessageDocument = {
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    await convRef.collection("messages").add(userMsg);

    // 会話履歴を取得
    const messagesSnap = await convRef
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const history = messagesSnap.docs.map((doc) => ({
      role: doc.data().role as "user" | "assistant",
      content: doc.data().content,
    }));

    // Gemini APIで応答生成
    const response = await generateChatResponse(history);

    // アシスタント応答を保存
    const assistantMsg: MessageDocument = {
      role: "assistant",
      content: response,
      createdAt: new Date().toISOString(),
    };
    await convRef.collection("messages").add(assistantMsg);

    // メタデータ更新
    await convRef.update({
      updatedAt: new Date().toISOString(),
      messageCount: history.length + 1,
    });

    return NextResponse.json({
      conversationId: convRef.id,
      message: response,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

---

### Phase 3: フロントエンド基本実装（2.5時間）

#### 3.1 チャット状態管理フック

**新規ファイル**: `/home/reisy/project/michibiki/hooks/use-chat.ts`

```typescript
"use client";

import { useState } from "react";
import type { Message } from "@/types";

export function useChat(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: content }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      return data.conversationId;
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, setMessages, sendMessage, isLoading };
}
```

#### 3.2 InputChatコンポーネント改修

**ファイル**: `/home/reisy/project/michibiki/components/layout/input-chat.tsx`

現在のコンポーネントを以下のように修正：

- `onSend` propを追加（`(message: string) => Promise<void>`）
- `isLoading` propを追加（送信中は入力・ボタン無効化）
- `handleSend` 内で `onSend(message)` を呼び出す
- console.log を削除

#### 3.3 メッセージ表示コンポーネント

**新規ファイル**: `/home/reisy/project/michibiki/components/chat/message-list.tsx`

```typescript
import type { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <span className="text-xs opacity-70 mt-1 block">
              {message.createdAt.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### 3.4 クライアント側チャットコンポーネント

**新規ファイル**: `/home/reisy/project/michibiki/components/chat/chat-interface.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InputChat } from '@/components/layout/input-chat';
import { MessageList } from './message-list';
import { useChat } from '@/hooks/use-chat';

interface ChatInterfaceProps {
  conversationId?: string;
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const { messages, sendMessage, isLoading } = useChat(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    const newConversationId = await sendMessage(content);

    if (!conversationId && newConversationId) {
      window.history.pushState(null, '', `/home?conversation=${newConversationId}`);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex justify-center">
          <div className="w-full max-w-3xl p-4">
            <MessageList messages={messages} />
          </div>
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 w-full flex justify-center p-4 bg-background">
        <InputChat onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
```

#### 3.5 ホームページの統合

**ファイル**: `/home/reisy/project/michibiki/app/home/page.tsx`

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";

interface HomePageProps {
  searchParams: { conversation?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return <ChatInterface conversationId={searchParams.conversation} />;
}
```

**重要**: Server Componentのまま維持し、認証チェック後にClient Componentを呼び出す構造。

---

### Phase 4: リアルタイム同期（2時間）

#### 4.1 useChat フックにリアルタイム同期を追加

**ファイル**: `/home/reisy/project/michibiki/hooks/use-chat.ts`

```typescript
"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Message, MessageDocument } from "@/types";

export function useChat(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // リアルタイム同期
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages",
    );
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data() as MessageDocument;
        return {
          id: doc.id,
          role: data.role,
          content: data.content,
          createdAt: new Date(data.createdAt),
        };
      });
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: content }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      return data.conversationId;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
}
```

**注意**: 楽観的UI更新を削除。Firestoreのリアルタイムリスナーが自動的にUIを更新します。

#### 4.2 会話一覧フック

**新規ファイル**: `/home/reisy/project/michibiki/hooks/use-conversations.ts`

```typescript
"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Conversation, ConversationDocument } from "@/types";

export function useConversations(userId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!userId) return;

    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newConversations: Conversation[] = snapshot.docs.map((doc) => {
        const data = doc.data() as ConversationDocument;
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          messageCount: data.messageCount,
        };
      });
      setConversations(newConversations);
    });

    return () => unsubscribe();
  }, [userId]);

  return { conversations };
}
```

#### 4.3 サイドバーに会話一覧を表示

**ファイル**: `/home/reisy/project/michibiki/components/layout/sidebar.tsx`

既存のサイドバーを修正し、会話一覧を表示：

- `useConversations` フックを使用
- userIdをpropsで受け取る
- 各会話をクリックで `/home?conversation={id}` に遷移
- 新規会話ボタンで `/home` に遷移

#### 4.4 サイドバーにuserIdを渡す

**ファイル**: `/home/reisy/project/michibiki/app/layout.tsx`

```typescript
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/sidebar";

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="jp">
      <body>
        <SidebarProvider>
          <AppSidebar userId={session?.user?.id} />
          <main className="w-full">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
```

---

### Phase 5: テスト・最適化（後回し可）

#### 5.1 Firestoreセキュリティルール

Firebaseコンソールで設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    match /conversations/{conversationId} {
      allow read, write: if request.auth.uid == resource.data.userId;

      match /messages/{messageId} {
        allow read, write: if request.auth.uid ==
          get(/databases/$(database)/documents/conversations/$(conversationId)).data.userId;
      }
    }
  }
}
```

#### 5.2 エラーハンドリング強化

- API Routeのリトライロジック
- タイムアウト処理
- ユーザーフレンドリーなエラーメッセージ

#### 5.3 パフォーマンス最適化

- Firestoreインデックス作成（Firebase Console）
- メッセージの無限スクロール（大量メッセージ対応）
- Gemini APIストリーミング対応

---

## クリティカルファイル

実装時に重要なファイル（優先順）:

1. `/home/reisy/project/michibiki/types/index.ts` - 型定義
2. `/home/reisy/project/michibiki/lib/gemini.ts` - Gemini APIラッパー（新規）
3. `/home/reisy/project/michibiki/app/api/chat/route.ts` - チャットAPI（新規）
4. `/home/reisy/project/michibiki/hooks/use-chat.ts` - チャット状態管理（新規）
5. `/home/reisy/project/michibiki/components/chat/chat-interface.tsx` - クライアント側チャットUI（新規）
6. `/home/reisy/project/michibiki/app/home/page.tsx` - ホームページ統合

---

## 検証手順

### Phase 2完了後

```bash
# Postman/curlでAPIテスト
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "こんにちは"}'
```

### Phase 3完了後

- ブラウザで `/home` にアクセス
- メッセージ送信 → UIに表示確認
- ローディング状態確認

### Phase 4完了後

- 2つのブラウザタブで同じ会話を開く
- 片方で送信 → もう片方に自動反映確認
- サイドバーの会話一覧更新確認

---

## 推定所要時間

- Phase 1: 45分
- Phase 2: 2時間
- Phase 3: 2.5時間
- Phase 4: 2時間
- Phase 5: 3時間（後回し可）

**最小構成（Phase 1-3）**: 約5時間
**フル機能（Phase 1-4）**: 約7時間

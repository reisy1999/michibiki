import { MessageRole } from "./index";

// firestoreにおけるuserの型
// const userRef = doc(db, "users", user.id)
export interface UserDocument {
  email: string;
  name: string;
  createdAt: string; // ISO 8601
}

/**
 * Firestore保存用の会話ドキュメント
 * idはFirestoreのdocument IDを使用するため、このインターフェースには含まれません
 */
export interface ConversationDocument {
  userId: string;
  title: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  messageCount: number;
}

export interface MessageDocument {
  role: MessageRole;
  content: string;
  createdAt: string; // ISO 8601
}

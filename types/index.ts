export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  steps: Step[];
  startDate: Date; // ✅ 必須
  targetDate?: Date; // ✅ 任意（目標達成日）
  createdAt: Date;
  completed: boolean;
}

export interface Step {
  id: string;
  title: string;
  description?: string;
  order: number;
  tasks: Task[];
  completed: boolean;
  completedAt?: Date; // 完了日時のみ
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;
}

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string; // メッセージの一意な識別子
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
  messageCount: number; //メッセージはサブコレクションとして別保存
}

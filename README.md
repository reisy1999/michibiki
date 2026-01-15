# Michibiki

> 週次目標管理 × 感情認識チャットボット × やわらかUI

**Status: 開発中**

## 概要

Michibikiは、週次目標の管理をAIチャットボットがサポートするWebアプリケーションです。
チャットの返信には感情アイコンが表示され、親しみやすいUIで目標達成をサポートします。

## 機能

### チャット機能

- Gemini APIを使用したAIチャット
- 返信に喜怒哀楽アイコン表示（😊😠😢😤）
- 会話履歴のFirebase保存

### 目標管理

- 週次目標（最大5個）
  - タイプA: 達成/未達成
  - タイプB: 週○回カウント
- AI助言機能
- 毎週日曜深夜3:00リセット

### 振り返り

- 日曜日に自動プロンプト
- 今週の達成度 + 来週の目標設定

### サイドバー

- 過去7日分のチャット履歴
- アカウント情報

## 技術スタック

| カテゴリ       | 技術                                |
| -------------- | ----------------------------------- |
| フレームワーク | Next.js 16 (App Router)             |
| 言語           | TypeScript                          |
| UI             | React 19, Tailwind CSS 4, shadcn/ui |
| 認証           | NextAuth.js v5 (Google OAuth)       |
| データベース   | Firebase / Firestore                |
| AI             | Gemini API (@google/genai)          |
| テスト         | Vitest                              |

## セットアップ

### 必要な環境変数

`.env.local` を作成:

```env
# Google OAuth (NextAuth)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_SECRET=

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Gemini
GEMINI_API_KEY=
```

### インストール

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセス

## ディレクトリ構成

```
app/
├── api/          # APIエンドポイント
├── home/         # ログイン後ページ
└── page.tsx      # トップページ

components/
├── ui/           # 汎用UIコンポーネント
├── auth/         # 認証関連
└── layout/       # レイアウト部品

lib/
├── auth.ts       # NextAuth設定
├── gemini.ts     # Gemini APIラッパー
└── firebase*.ts  # Firebase接続

types/
├── index.ts      # ドメイン型
└── firestore.ts  # DB保存用型
```

詳細は [docs/architecture.md](docs/architecture.md) を参照

## 開発コマンド

```bash
npm run dev       # 開発サーバー起動
npm run build     # 本番ビルド
npm run lint      # Lint実行
npm run test      # テスト実行
npm run test:ui   # テストUI起動
```

## ライセンス

Private

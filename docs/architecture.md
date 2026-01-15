# ディレクトリ構成とアーキテクチャ

## 全体構成図

```mermaid
graph TB
    subgraph Browser["ブラウザ (クライアント)"]
        Page["app/**/page.tsx<br/>ページUI"]
        Components["components/**<br/>UIコンポーネント"]
    end

    subgraph Server["サーバー (Next.js)"]
        API["app/api/**/route.ts<br/>APIエンドポイント"]
        Lib["lib/**<br/>共通ロジック"]
    end

    subgraph External["外部サービス"]
        Gemini["Gemini API"]
        Firebase["Firebase/Firestore"]
        Google["Google OAuth"]
    end

    Page --> Components
    Page -->|fetch| API
    API --> Lib
    Lib -->|認証| Google
    Lib -->|データ保存| Firebase
    Lib -->|AI生成| Gemini
```

## ディレクトリ役割

```mermaid
graph LR
    subgraph app["app/ - ルーティング"]
        direction TB
        A1["page.tsx - ページ本体"]
        A2["layout.tsx - 共通レイアウト"]
        A3["api/*/route.ts - APIハンドラ"]
    end

    subgraph components["components/ - UIパーツ"]
        direction TB
        C1["ui/ - 汎用UI (Button等)"]
        C2["auth/ - 認証関連UI"]
        C3["layout/ - レイアウト部品"]
    end

    subgraph lib["lib/ - ビジネスロジック"]
        direction TB
        L1["auth.ts - NextAuth設定"]
        L2["gemini.ts - AI API"]
        L3["firebase*.ts - DB接続"]
    end

    subgraph types["types/ - 型定義"]
        direction TB
        T1["index.ts - ドメイン型"]
        T2["firestore.ts - DB保存用型"]
    end
```

## チャット機能のデータフロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant P as page.tsx
    participant I as InputChat
    participant R as /api/chat/route.ts
    participant G as lib/gemini.ts
    participant A as Gemini API

    U->>I: メッセージ入力
    I->>P: 状態更新
    P->>R: POST /api/chat
    R->>G: chat(contents)
    G->>A: generateContent()
    A-->>G: レスポンス
    G-->>R: テキスト
    R-->>P: JSON
    P->>P: 状態更新
    P-->>U: 表示
```

## ディレクトリ詳細

| ディレクトリ | 役割 | 実行環境 |
|-------------|------|----------|
| `app/` | ルーティングとページ定義 | サーバー/クライアント |
| `app/api/` | RESTful APIエンドポイント | サーバーのみ |
| `components/ui/` | shadcn/ui ベースの汎用コンポーネント | クライアント |
| `components/auth/` | 認証ボタン等 | クライアント |
| `components/layout/` | ページレイアウト部品 | クライアント |
| `lib/` | サーバーサイドロジック | サーバーのみ |
| `types/` | TypeScript型定義 | 両方 |
| `hooks/` | カスタムReactフック | クライアント |

## 重要な境界

```mermaid
graph TB
    subgraph Client["クライアント (ブラウザ)"]
        UI["UI Components"]
        Hooks["Hooks"]
    end

    subgraph Server["サーバー (Node.js)"]
        Routes["API Routes"]
        LibServer["lib/ (認証, DB, AI)"]
    end

    UI -.->|"環境変数アクセス不可<br/>APIキー使用不可"| Server
    UI -->|"fetch() で通信"| Routes

    style Server fill:#e1f5fe
    style Client fill:#fff3e0
```

- **クライアント**: `NEXT_PUBLIC_*` の環境変数のみアクセス可
- **サーバー**: 全ての環境変数にアクセス可（APIキー等）

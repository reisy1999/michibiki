# CSS設計原則

## コンポーネントとページのCSS責任分担

### 基本原則

**コンポーネント（use client）**: 「このコンポーネントがどう見えるか」
- コンポーネントの内在的な見た目
- どこで使われても同じ見た目を保つスタイル

**ページ（page.tsx）**: 「このコンポーネントをどこに置くか」
- ページ内での配置・位置
- レイアウト構造

---

## 具体例: InputChatコンポーネント

### コンポーネント内部（input-chat.tsx）で定義すべきスタイル

```tsx
// components/layout/input-chat.tsx
export function InputChat() {
  return (
    <div className="w-full max-w-3xl"> {/* コンポーネントの最大幅制御 */}
      <InputGroup>
        <TextareaAutosize
          className="min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5"
          {/* 内部要素の見た目 */}
        />
        <InputGroupButton
          className="rounded-full ml-auto"
          {/* ボタンの形状 */}
        />
      </InputGroup>
    </div>
  )
}
```

**責務:**
- `w-full`: 親から与えられた幅を100%使う（柔軟性）
- `max-w-3xl`: コンポーネント自身の最大幅（768px）を制限
- `min-h-16`: 最小高さ
- `rounded-md`, `px-3`, `py-2.5`: 内部要素の装飾
- `rounded-full`: ボタンの形状

### ページ側（page.tsx）で定義すべきスタイル

```tsx
// app/home/page.tsx
export default async function HomePage() {
  return (
    <div className="h-screen flex flex-col">
      <ScrollArea className="flex-1">
        {/* チャット履歴 */}
      </ScrollArea>

      {/* 入力欄の配置制御 */}
      <div className="
        sticky bottom-0
        w-full
        flex justify-center
        p-4 sm:p-6
        bg-background border-t
      ">
        <InputChat />
      </div>
    </div>
  )
}
```

**責務:**
- `sticky bottom-0`: 画面下部に固定
- `flex justify-center`: 中央揃え
- `p-4 sm:p-6`: レスポンシブ余白（画面サイズによる変化）
- `bg-background border-t`: ページコンテキストでの装飾

---

## 責任分担の判断基準

| スタイル | コンポーネント | ページ | 理由 |
|---------|---------------|--------|------|
| **最大幅（max-w-*）** | ✓ | | コンポーネントの可読性を保つため |
| **親幅追従（w-full）** | ✓ | | 柔軟に使えるように |
| **画面内配置（sticky, absolute）** | | ✓ | ページレイアウトの責任 |
| **中央揃え（justify-center）** | | ✓ | ページ内での配置 |
| **余白（margin, padding）** | 場合による | ✓ | 外側の余白はページ、内側はコンポーネント |
| **背景・ボーダー** | 場合による | 場合による | コンテキストによる |
| **内部要素の装飾** | ✓ | | コンポーネント固有の見た目 |

---

## レスポンシブデザインの扱い

### コンポーネント内のレスポンシブ
コンポーネント自身の見た目の変化

```tsx
// コンポーネント内
className="text-base md:text-sm"  // フォントサイズの変化
className="p-2 sm:p-3"            // 内部パディングの変化
```

### ページ側のレスポンシブ
配置や余白の変化

```tsx
// ページ側
className="p-4 sm:p-6 lg:p-8"     // 外側の余白の変化
className="flex-col md:flex-row"  // レイアウト構造の変化
```

---

## よくある間違い

### ❌ 悪い例: コンポーネント側で配置を制御
```tsx
// components/layout/input-chat.tsx
<div className="fixed bottom-0 left-0 right-0 flex justify-center">
  {/* 配置はページ側の責任 */}
</div>
```

### ✓ 良い例: ページ側で配置を制御
```tsx
// app/home/page.tsx
<div className="fixed bottom-0 left-0 right-0 flex justify-center">
  <InputChat /> {/* コンポーネントは見た目だけ */}
</div>
```

---

## まとめ

- **コンポーネント**: どこで使われても一貫した見た目を保つスタイル
- **ページ**: そのページ特有の配置やレイアウト
- **判断基準**: 「他のページで使った時も同じスタイルが必要か？」
  - YES → コンポーネント
  - NO → ページ

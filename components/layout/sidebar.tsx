// サイドバーコンポーネント
// home/page.tsxで使用するシンプルなナビゲーションサイドバー

import Link from "next/link"

export function Sidebar() {
  // ナビゲーションアイテムの配列
  const navItems = [
    { name: "ホーム", href: "/home", icon: "🏠" },
    { name: "プロフィール", href: "/home/profile", icon: "👤" },
    { name: "設定", href: "/home/settings", icon: "⚙️" },
  ]

  return (
    <aside className="w-64 h-screen bg-gray-100 border-r border-gray-200 p-4">
      {/* サイドバーのヘッダー */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">みちびき</h2>
      </div>

      {/* ナビゲーションリスト */}
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-gray-700">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

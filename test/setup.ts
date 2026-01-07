import { beforeAll, afterEach, vi } from "vitest";

// 全テスト実行前に1度だけ実行される
beforeAll(() => {
  // テスト用の環境変数を設定
  process.env.FIREBASE_PROJECT_ID = "test-project-id";
  process.env.FIREBASE_CLIENT_EMAIL =
    "test@test-project.iam.gserviceaccount.com";
  process.env.FIREBASE_PRIVATE_KEY = "test-private-key";
});

// 各テストの後に実行される
afterEach(() => {
  // モックをクリア（次のテストに影響させない）
  vi.clearAllMocks();
});

//ログイン後最初のページ
import { auth } from "@/lib/auth";
import { SignOut } from "@/components/auth/sign-out";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  // ログインしてなければトップへ
  if (!session) {
    redirect("/");
  }
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{session.user?.name}</h1>
          <h2>
            <ul>
              <li>{session.user?.email}</li>
              <li>{session.user?.image}</li>
              <li>{session.user?.id}</li>
              <li>{session.expires}</li>
            </ul>
          </h2>
          <SignOut />
        </div>
      </div>
    </div>
  );
}

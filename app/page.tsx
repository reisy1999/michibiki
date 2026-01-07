import SignIn from "@/components/auth/sign-in";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Michibiki</h1>
        <SignIn />
      </div>
    </div>
  );
}

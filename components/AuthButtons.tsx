"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButtons() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <button onClick={() => signIn("google")} className="px-3 py-2 bg-blue-600 text-white rounded">
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img src={session.user?.image ?? ""} alt="avatar" className="w-8 h-8 rounded-full" />
      <span className="text-sm">{session.user?.name}</span>
      <button onClick={() => signOut()} className="px-2 py-1 bg-gray-200 rounded text-sm">
        Sign out
      </button>
    </div>
  );
}

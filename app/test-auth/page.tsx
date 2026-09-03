import { createClient } from "@/lib/supabase/server";

export default async function TestAuthPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#f5f2ea] p-6 text-[#171a35]">
      <h1 className="text-2xl font-bold">Auth Test</h1>

      {user ? (
        <div className="mt-6">
          <p className="font-semibold text-green-700">
            ✓ You are logged in
          </p>

          <p className="mt-2 text-sm">
            Email: {user.email}
          </p>

          <p className="mt-2 text-sm">
            User ID: {user.id}
          </p>
        </div>
      ) : (
        <p className="mt-6 font-semibold text-red-600">
          ✕ You are not logged in
        </p>
      )}
    </main>
  );
}
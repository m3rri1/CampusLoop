import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md rounded-3xl shadow-xl border-0">
        <CardContent className="p-8">

          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-violet-600">
              CampusLoop
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              One Campus. Endless Connections.
            </p>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">
              Welcome Back 👋
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              Login to continue your journey.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">

            <Input
              type="email"
              placeholder="College Email"
            />

            <Input
              type="password"
              placeholder="Password"
            />

            <Button className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-700">
              Login
            </Button>

          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200"></div>

            <span className="text-xs text-zinc-400">
              OR
            </span>

            <div className="h-px flex-1 bg-zinc-200"></div>
          </div>

          {/* Google Button */}
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl"
          >
            Continue with Google
          </Button>

          {/* Signup */}
          <p className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <span className="font-semibold text-violet-600 cursor-pointer">
              Sign Up
            </span>
          </p>

        </CardContent>
      </Card>
    </main>
  );
}
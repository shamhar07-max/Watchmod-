import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

async function authenticate(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: (formData.get("callbackUrl") as string) || "/admin",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return;
    }
    throw err;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-lg font-bold text-slate-900">
          UAE<span className="text-blue-600">PCS</span> Staff Login
        </p>
        <p className="mt-1 text-sm text-slate-500">Internal operations dashboard</p>

        <form action={authenticate} className="mt-6 space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/admin"} />
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Email</span>
            <input name="email" type="email" required className="input mt-1" />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Password</span>
            <input name="password" type="password" required className="input mt-1" />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

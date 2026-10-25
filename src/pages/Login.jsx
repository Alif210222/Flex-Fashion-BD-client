
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({
        email: form.email.trim(),
        password: form.password,
      });

      const requestedPath = location.state?.from;
      const safeRequestedPath =
        typeof requestedPath === "string" &&
        requestedPath.startsWith("/") &&
        !requestedPath.startsWith("//")
          ? requestedPath
          : null;

      if (user.role === "admin") {
        navigate(safeRequestedPath?.startsWith("/admin")
          ? safeRequestedPath
          : "/admin", { replace: true });
      } else {
        navigate(
          safeRequestedPath && !safeRequestedPath.startsWith("/admin")
            ? safeRequestedPath
            : "/",
          { replace: true }
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F3EB] px-5 py-10 text-[#292821]">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-9 block text-center text-2xl font-semibold tracking-[0.16em]"
        >
          FLEX<span className="text-[#A99A82]">.</span>
        </Link>

        <div className="border border-[#E3DCCE] bg-[#FBF9F4] p-6 sm:p-9">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#817665]">
            Welcome back
          </p>

          <h1 className="mt-3 text-2xl font-medium tracking-tight">
            Sign in to FLEX
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#777064]">
            Access your account and continue shopping.
          </p>

          {location.state?.message && (
            <p className="mt-4 text-sm text-green-800" role="status">
              {location.state.message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={254}
                placeholder="you@example.com"
                className="w-full rounded-sm border border-[#D8D0C2] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[#292821]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  maxLength={72}
                  placeholder="Enter your password"
                  className="w-full rounded-sm border border-[#D8D0C2] bg-transparent px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#292821]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-3 text-[#817665]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#292821] px-5 py-3.5 text-sm font-medium text-[#F7F3EB] transition hover:bg-[#514B3F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <Link  to="/">
          <button
         
          className="flex w-full items-center justify-center mt-2  rounded-sm bg-[#292821] px-5 py-3.5 text-sm font-medium text-[#F7F3EB] transition hover:bg-[#514B3F] disabled:cursor-not-allowed disabled:opacity-60">
              Back to home
          </button>
          </Link>
          

          <p className="mt-6 text-center text-sm text-[#777064]">
            New to FLEX?{" "}
            <Link
              to="/register"
              className="font-medium text-[#292821] underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[#817665]">
          Everyday essentials, made better.
        </p>
      </div>
    </main>
  );
}


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (form.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 72) {
      setError("Password must be between 8 and 72 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/login", {
        replace: true,
        state: { message: "Account created successfully. Please log in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't create your account. Please try again."
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
            Join Flex-Fashion BD
          </p>

          <h1 className="mt-3 text-2xl font-medium tracking-tight">
            Create your account
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#777064]">
            Create an account to make shopping easier.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={80}
                placeholder="Enter your full name"
                className="w-full rounded-sm border border-[#D8D0C2] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[#292821]"
              />
            </div>

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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  maxLength={72}
                  placeholder="At least 8 characters"
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter your password"
                className="w-full rounded-sm border border-[#D8D0C2] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[#292821]"
              />
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
              {loading ? "Creating account..." : "Create account"}
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
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#292821] underline underline-offset-4"
            >
              Sign in
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

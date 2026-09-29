import { useState } from "react";
import API_URL from "../../api";
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general: data.message || "Login failed.",
        });
        return;
      }

      // Store authentication information
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Login successful:", data);

      // Redirect based on role
      if (data.user.role === "TRADER") {
        window.location.href = "/trader/dashboard";
      } else if (data.user.role === "OFFICER") {
        window.location.href = "/officer/dashboard";
      } else {
        setErrors({
          general: "Invalid user role.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      setErrors({
        general: "Unable to connect to the server.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f8]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#164a63] text-sm font-bold text-white">
              W
            </div>

            <div>
              <h1 className="text-lg font-semibold text-[#164a63]">
                WebFlux
              </h1>

              <p className="text-[11px] text-slate-500">
                Legal Metrology Digital Platform
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#164a63]"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-74px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-7 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#287d4b]">
              Secure Access
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Sign in to WebFlux
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Access your instruments, verification applications and
              certificates.
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
                />

                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-[#164a63] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {errors.general}
                </div>
              )}

              {/* Login */}
              <button
                type="submit"
                className="w-full rounded-md bg-[#164a63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123e53]"
              >
                Sign in
              </button>

              {/* Security */}
              <div className="flex gap-3 border-t border-slate-200 pt-5">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-[#287d4b]"
                />

                <p className="text-xs leading-5 text-slate-500">
                  WebFlux uses secure authentication to protect account and
                  instrument information.
                </p>
              </div>

              {/* Register */}
              <p className="text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-[#164a63] hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </form>
          </div>

          {/* Officer access */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500">
              Are you a Legal Metrology Officer?
            </p>

            <Link
              to="/officer/login"
              className="mt-1 inline-block text-sm font-medium text-[#164a63] hover:underline"
            >
              Officer login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
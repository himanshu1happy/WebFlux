import { useEffect, useState } from "react";
import API_URL from "../../api";
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // New State for the 3 Login Options
  const [activeTab, setActiveTab] = useState("TRADER"); 

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const verificationMessage = location.state?.message || "";

  useEffect(() => {
    if (verificationMessage) {
      setErrors({ success: verificationMessage });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [verificationMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email address is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({ success: verificationMessage });

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          role: activeTab, // Send the selected tab to the backend
        }),
      });

      const data = await response.json();

      if (response.status === 403 && data.requiresEmailVerification) {
        navigate("/verify-email", { state: { email: data.email || formData.email.trim() } });
        return;
      }

      if (!response.ok) {
        setErrors({ general: data.message || "Login failed. Please check your credentials." });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "TRADER") {
        navigate("/trader/dashboard", { replace: true });
      } else if (data.user.role === "OFFICER") {
        navigate("/officer/dashboard", { replace: true });
      } else if (data.user.role === "GATC") {
        navigate("/gatc/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "Unable to connect to the server. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f8]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#164a63] text-sm font-bold text-white">W</div>
            <div>
              <h1 className="text-lg font-semibold text-[#164a63]">WebFlux</h1>
              <p className="text-[11px] text-slate-500">Legal Metrology Digital Platform</p>
            </div>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#164a63]">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-74px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#287d4b]">Secure Access</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Sign in to WebFlux</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Access your instruments, verification applications and certificates.</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
            
            {/* 3-Option Tab Selector */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("TRADER")}
                className={`flex-1 text-xs sm:text-sm font-medium py-2 rounded-md transition ${activeTab === "TRADER" ? "bg-white shadow text-[#164a63]" : "text-slate-500 hover:text-slate-700"}`}
              >
                Trader
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("OFFICER")}
                className={`flex-1 text-xs sm:text-sm font-medium py-2 rounded-md transition ${activeTab === "OFFICER" ? "bg-white shadow text-[#164a63]" : "text-slate-500 hover:text-slate-700"}`}
              >
                LMO Officer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("GATC")}
                className={`flex-1 text-xs sm:text-sm font-medium py-2 rounded-md transition ${activeTab === "GATC" ? "bg-white shadow text-[#164a63]" : "text-slate-500 hover:text-slate-700"}`}
              >
                GATC
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.success && <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">{errors.success}</div>}
              {errors.general && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{errors.general}</div>}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#164a63]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-[#164a63]"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-md bg-[#164a63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123e53] disabled:opacity-60">
                {loading ? "Signing in..." : `Sign in as ${activeTab}`}
              </button>

              {/* Only show "Create an account" if TRADER is selected */}
              {activeTab === "TRADER" && (
                <p className="text-center text-sm text-slate-500 pt-3 border-t border-slate-100">
                  Don't have an account? <Link to="/register" className="font-medium text-[#164a63] hover:underline">Create an account</Link>
                </p>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
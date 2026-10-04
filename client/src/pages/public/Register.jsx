import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../../api";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    role: "TRADER",
    fullName: "",
    businessName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!formData.businessName.trim()) newErrors.businessName = "Organization/Business name is required.";
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) newErrors.mobile = "Enter a valid 10-digit mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = "Enter a valid email address.";
    if (formData.password.length < 8) newErrors.password = "Password must contain at least 8 characters.";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setServerError("");
      const normalizedEmail = formData.email.trim().toLowerCase();
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.businessName.trim(),
          contactPerson: formData.fullName.trim(),
          mobile: formData.mobile,
          email: normalizedEmail,
          password: formData.password,
          role: formData.role, // Now uses dynamic role
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Registration failed.");

      sessionStorage.setItem("verificationEmail", normalizedEmail);
      navigate("/verify-email");
    } catch (error) {
      console.error("Registration error:", error);
      setServerError(error.message || "Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic labels based on role
  const getOrgLabel = () => {
    if (formData.role === "OFFICER") return "Department / Jurisdiction Name";
    if (formData.role === "GATC") return "Test Centre Name";
    return "Business / Establishment Name";
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

      <main className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#287d4b]">Stakeholder Registration</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Create your WebFlux account</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Select your stakeholder role and register to access the Legal Metrology verification system.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="font-semibold text-slate-900">Account information</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {serverError && <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{serverError}</div>}

            

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full Name <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
                />
                {errors.fullName && <p className="mt-1.5 text-xs text-red-600">{errors.fullName}</p>}
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{getOrgLabel()} <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Organization name"
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
                />
                {errors.businessName && <p className="mt-1.5 text-xs text-red-600">{errors.businessName}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Mobile number <span className="text-red-600">*</span></label>
                <input
                  type="tel"
                  name="mobile"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
                />
                {errors.mobile && <p className="mt-1.5 text-xs text-red-600">{errors.mobile}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email address <span className="text-red-600">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
                />
                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password <span className="text-red-600">*</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-11 text-sm outline-none focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password <span className="text-red-600">*</span></label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-11 text-sm outline-none focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#287d4b]" />
              <div>
                <p className="text-sm font-medium text-slate-800">Your account is protected</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your password is securely processed. A verification OTP will be sent to your email.
                </p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-md bg-[#164a63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123e53] disabled:opacity-60">
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <p className="text-center text-sm text-slate-500">
              Already have an account? <Link to="/login" className="font-medium text-[#164a63] hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Register;
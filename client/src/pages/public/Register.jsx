import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business or establishment name is required.";
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log("Registration data:", formData);

    alert("Form validated successfully. Backend integration will be added next.");
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
      <main className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#287d4b]">
            Trader Registration
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Create your WebFlux account
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Create one account for your business or establishment. You can
            add and manage multiple weighing and measuring instruments from
            your dashboard.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="font-semibold text-slate-900">
              Account information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Enter your basic details to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full name <span className="text-red-600">*</span>
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
              />

              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Business Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Business / Establishment name{" "}
                <span className="text-red-600">*</span>
              </label>

              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Enter business or establishment name"
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
              />

              {errors.businessName && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.businessName}
                </p>
              )}
            </div>

            {/* Mobile + Email */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mobile number <span className="text-red-600">*</span>
                </label>

                <input
                  type="tel"
                  name="mobile"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
                />

                {errors.mobile && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.mobile}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email address <span className="text-red-600">*</span>
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
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password <span className="text-red-600">*</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
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

              <p className="mt-2 text-xs text-slate-500">
                Use at least 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Confirm password <span className="text-red-600">*</span>
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Security Note */}
            <div className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-[#287d4b]"
              />

              <div>
                <p className="text-sm font-medium text-slate-800">
                  Your account is protected
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Email and mobile verification will be required before the
                  account becomes active.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-md bg-[#164a63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123e53]"
            >
              Continue
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#164a63] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Register;
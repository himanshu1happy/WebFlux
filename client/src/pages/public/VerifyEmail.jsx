import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import API_URL from "../../api";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [countdown, setCountdown] = useState(0);

  // ==========================================
  // Get email
  // ==========================================

  useEffect(() => {
    const stateEmail =
      location.state?.email || "";

    const storedEmail =
      sessionStorage.getItem(
        "verificationEmail"
      ) || "";

    const emailValue =
      stateEmail || storedEmail;

    setEmail(emailValue);

    if (stateEmail) {
      sessionStorage.setItem(
        "verificationEmail",
        stateEmail
      );
    }
  }, [location.state]);

  // ==========================================
  // Countdown
  // ==========================================

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(
        (previous) => previous - 1
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // ==========================================
  // Verify OTP
  // ==========================================

  const handleVerify = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Email address is missing. Please register again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Please enter the 6-digit OTP."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/verify-email`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Email verification failed."
        );
      }

      setMessage(
        data.message ||
          "Email verified successfully."
      );

      sessionStorage.removeItem(
        "verificationEmail"
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (err) {
      setError(
        err.message ||
          "Unable to verify email."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Resend OTP
  // ==========================================

  const handleResend = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Email address is missing."
      );
      return;
    }

    if (countdown > 0) return;

    try {
      setResending(true);

      const response = await fetch(
        `${API_URL}/api/auth/resend-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to resend OTP."
        );
      }

      setMessage(
        data.message ||
          "A new OTP has been sent."
      );

      setOtp("");
      setCountdown(60);
    } catch (err) {
      setError(
        err.message ||
          "Unable to resend OTP."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="text-center mb-7">

          <div className="mx-auto w-12 h-12 rounded-xl bg-[#164A63] flex items-center justify-center">

            <ShieldCheck
              size={26}
              className="text-white"
            />

          </div>

          <h1 className="text-2xl font-bold text-[#1F2933] mt-4">
            Verify your email
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Enter the 6-digit OTP sent to
            your email address.
          </p>

        </div>

        {/* Card */}

        <div className="bg-white border border-[#D9E0E5] rounded-xl p-6 sm:p-8">

          {/* Success */}

          {message && (
            <div className="mb-5 p-3 rounded-lg bg-green-50 border border-green-200 flex gap-2">

              <CheckCircle2
                size={18}
                className="text-green-600 flex-shrink-0 mt-0.5"
              />

              <p className="text-sm text-green-700">
                {message}
              </p>

            </div>
          )}

          {/* Error */}

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex gap-2">

              <AlertCircle
                size={18}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />

              <p className="text-sm text-red-700">
                {error}
              </p>

            </div>
          )}

          <form
            onSubmit={handleVerify}
            className="space-y-5"
          >

            {/* Email */}

            <div>

              <label className="block text-sm font-medium text-[#1F2933] mb-2">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  className="w-full pl-10 pr-3 py-3 border border-[#D9E0E5] rounded-lg outline-none focus:border-[#164A63] focus:ring-1 focus:ring-[#164A63]"
                  placeholder="you@example.com"
                  required
                />

              </div>

            </div>

            {/* OTP */}

            <div>

              <label className="block text-sm font-medium text-[#1F2933] mb-2">
                Verification OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) => {
                  const value =
                    event.target.value.replace(
                      /\D/g,
                      ""
                    );

                  setOtp(value);
                }}
                placeholder="Enter 6-digit OTP"
                className="w-full px-3 py-3 border border-[#D9E0E5] rounded-lg text-center tracking-[0.35em] text-lg font-semibold outline-none focus:border-[#164A63] focus:ring-1 focus:ring-[#164A63]"
                required
              />

            </div>

            {/* Verify */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#164A63] text-white rounded-lg font-medium hover:bg-[#123C50] transition disabled:opacity-60 flex items-center justify-center gap-2"
            >

              {loading ? (
                <>
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2
                    size={18}
                  />
                  Verify Email
                </>
              )}

            </button>

          </form>

          {/* Resend */}

          <div className="mt-6 text-center">

            <p className="text-sm text-slate-500">
              Didn't receive the OTP?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={
                resending ||
                countdown > 0
              }
              className="mt-2 text-sm font-medium text-[#164A63] hover:underline disabled:text-slate-400 disabled:no-underline"
            >

              {resending
                ? "Sending..."
                : countdown > 0
                ? `Resend OTP in ${countdown}s`
                : "Resend OTP"}

            </button>

          </div>

        </div>

        <p className="text-center text-sm text-slate-500 mt-5">

          Already verified?{" "}

          <Link
            to="/login"
            className="font-medium text-[#164A63] hover:underline"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default VerifyEmail;
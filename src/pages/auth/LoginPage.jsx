import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScanLine, Mail, ShieldCheck, ArrowRight } from "lucide-react";

import { loginSendOtpSchema, otpVerifySchema } from "../../utils/validators.js";
import { sendLoginOtp, verifyLoginOtp } from "../../services/auth.service.js";
import { getErrorMessage } from "../../lib/axios.js";
import { GOOGLE_OAUTH_URL } from "../../config/env.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../context/ToastContext.jsx";
import Button from "../../components/ui/Button.jsx";
import { Field, Input } from "../../components/ui/Input.jsx";

const GoogleGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" width="18" height="18">
    <path fill="#4285F4" d="M23.5 12.3c0-.85-.08-1.66-.22-2.45H12v4.63h6.47c-.28 1.48-1.13 2.74-2.4 3.58v2.98h3.88c2.27-2.09 3.55-5.17 3.55-8.74z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-2.98c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.12-6.73-4.96H1.26v3.07C3.24 21.3 7.28 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.31A7.2 7.2 0 0 1 4.88 12c0-.8.14-1.58.39-2.31V6.62H1.26A11.97 11.97 0 0 0 0 12c0 1.94.46 3.77 1.26 5.38l4.01-3.07z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.62l4.01 3.07C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

export default function LoginPage() {
  const { isAuthenticated, applySession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState("email"); // email | otp
  const [emailForOtp, setEmailForOtp] = useState("");
  const [expiresIn, setExpiresIn] = useState(null);

  const sendForm = useForm({ resolver: zodResolver(loginSendOtpSchema), defaultValues: { email: "" } });
  const verifyForm = useForm({ resolver: zodResolver(otpVerifySchema), defaultValues: { email: "", otp: "" } });

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />;
  }

const onSendOtp = async (values) => {
  try {
    const res = await sendLoginOtp(values);

    setEmailForOtp(values.email);
    setExpiresIn(res.data?.expiresInSeconds);
    verifyForm.setValue("email", values.email);
    setStep("otp");

    // Development only
    if (res.data?.otp) {
      alert(`Your OTP is: ${res.data.otp}`);
    }

    toast.success(res.message || "Code sent to your email.");
  } catch (err) {
    toast.error(getErrorMessage(err));
  }
};

  const onVerifyOtp = async (values) => {
    try {
      const res = await verifyLoginOtp(values);
      applySession(res.data.user, res.data.accessToken);
      toast.success(res.message || "Welcome back.");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink-950 p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal/15 text-signal">
            <ScanLine className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">CardVault</span>
        </div>

        <div>
          <p className="font-display text-4xl font-bold leading-tight">
            Every business card,
            <br />
            instantly searchable.
          </p>
          <p className="mt-4 max-w-md text-ink-300">
            Scan, parse, and organize business cards across your whole team — with
            role-based access for admins, staff, and everyone in between.
          </p>
        </div>

        <div className="relative h-24 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <div className="absolute inset-x-0 top-0 h-0.5 animate-scanline bg-signal/80 shadow-[0_0_12px_2px_rgba(45,212,191,0.6)]" />
          <div className="flex h-full items-center px-4 font-mono text-xs text-ink-300">
            frontImage.jpg → OCR → parsedData{"{"} name, company, phones[] {"}"}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-canvas px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-signal">
                <ScanLine className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold text-ink-900">CardVault</span>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold text-ink-900">Welcome back</h2>
          <p className="mt-1 text-sm text-ink-400">Sign in to your CardVault workspace.</p>

          <a href={GOOGLE_OAUTH_URL} className="mt-6 block">
            <Button variant="outline" className="w-full">
              <GoogleGlyph /> Continue with Google
            </Button>
          </a>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-ink-100" />
            <span className="text-xs font-medium text-ink-400">OR CONTINUE WITH EMAIL</span>
            <div className="h-px flex-1 bg-ink-100" />
          </div>

          {step === "email" ? (
            <form onSubmit={sendForm.handleSubmit(onSendOtp)} className="space-y-4">
              <Field label="Email address" error={sendForm.formState.errors.email?.message} required>
                <Input type="email" placeholder="you@company.com" {...sendForm.register("email")} />
              </Field>
              <Button type="submit" className="w-full" isLoading={sendForm.formState.isSubmitting}>
                <Mail className="h-4 w-4" /> Send login code
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyForm.handleSubmit(onVerifyOtp)} className="space-y-4">
              <p className="rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600">
                We sent a code to <span className="font-medium text-ink-900">{emailForOtp}</span>
                {expiresIn && <span className="text-ink-400"> · expires in {Math.round(expiresIn / 60)} min</span>}
              </p>
              <Field label="Verification code" error={verifyForm.formState.errors.otp?.message} required>
                <Input
                  inputMode="numeric"
                  autoFocus
                  placeholder="6-digit code"
                  className="tracking-[0.5em] text-center font-mono text-lg"
                  {...verifyForm.register("otp")}
                />
              </Field>
              <Button type="submit" className="w-full" isLoading={verifyForm.formState.isSubmitting}>
                <ShieldCheck className="h-4 w-4" /> Verify & sign in
              </Button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="flex w-full items-center justify-center gap-1 text-sm text-ink-500 hover:text-ink-800"
              >
                Use a different email
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-ink-500">
            New here?{" "}
            <Link to="/register" className="inline-flex items-center gap-0.5 font-medium text-ink-900 hover:underline">
              Create an account <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

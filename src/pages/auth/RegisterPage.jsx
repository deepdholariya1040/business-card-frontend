import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScanLine, ShieldCheck, UserPlus } from "lucide-react";

import { registerSendOtpSchema, otpVerifySchema } from "../../utils/validators.js";
import { sendRegisterOtp, verifyRegisterOtp } from "../../services/auth.service.js";
import { getErrorMessage } from "../../lib/axios.js";
import { GOOGLE_OAUTH_URL } from "../../config/env.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../context/ToastContext.jsx";
import Button from "../../components/ui/Button.jsx";
import { Field, Input } from "../../components/ui/Input.jsx";

export default function RegisterPage() {
  const { isAuthenticated, applySession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState("details");
  const [email, setEmail] = useState("");

  const detailsForm = useForm({ resolver: zodResolver(registerSendOtpSchema), defaultValues: { name: "", email: "" } });
  const verifyForm = useForm({ resolver: zodResolver(otpVerifySchema), defaultValues: { email: "", otp: "" } });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSendOtp = async (values) => {
    try {
      const res = await sendRegisterOtp(values);
      setEmail(values.email);
      verifyForm.setValue("email", values.email);
      setStep("otp");
      toast.success(res.message || "Verification code sent.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onVerifyOtp = async (values) => {
    try {
      const res = await verifyRegisterOtp(values);
      applySession(res.data.user, res.data.accessToken);
      toast.success(res.message || "Account created.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-signal">
            <ScanLine className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold text-ink-900">CardVault</span>
        </div>

        <h2 className="font-display text-2xl font-bold text-ink-900">Create your account</h2>
        <p className="mt-1 text-sm text-ink-400">Start scanning and organizing business cards.</p>

        {step === "details" ? (
          <>
            <form onSubmit={detailsForm.handleSubmit(onSendOtp)} className="mt-6 space-y-4">
              <Field label="Full name" error={detailsForm.formState.errors.name?.message} required>
                <Input placeholder="Jordan Rivera" {...detailsForm.register("name")} />
              </Field>
              <Field label="Email address" error={detailsForm.formState.errors.email?.message} required>
                <Input type="email" placeholder="you@company.com" {...detailsForm.register("email")} />
              </Field>
              <Button type="submit" className="w-full" isLoading={detailsForm.formState.isSubmitting}>
                <UserPlus className="h-4 w-4" /> Send verification code
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-ink-100" />
              <span className="text-xs font-medium text-ink-400">OR</span>
              <div className="h-px flex-1 bg-ink-100" />
            </div>

            <a href={GOOGLE_OAUTH_URL} className="block">
              <Button variant="outline" className="w-full">
                Continue with Google instead
              </Button>
            </a>
          </>
        ) : (
          <form onSubmit={verifyForm.handleSubmit(onVerifyOtp)} className="mt-6 space-y-4">
            <p className="rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600">
              We sent a code to <span className="font-medium text-ink-900">{email}</span>
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
              <ShieldCheck className="h-4 w-4" /> Verify & create account
            </Button>
            <button
              type="button"
              onClick={() => setStep("details")}
              className="w-full text-center text-sm text-ink-500 hover:text-ink-800"
            >
              Back
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-ink-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

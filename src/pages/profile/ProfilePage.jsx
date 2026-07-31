import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Save, Mail, ShieldCheck, Building2 } from "lucide-react";

import { updateUser } from "../../services/users.service.js";
import { fetchDashboardStats } from "../../services/dashboard.service.js";
import { getErrorMessage } from "../../lib/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { roleLabel } from "../../config/roles.js";
import { percentOf, formatDate } from "../../utils/format.js";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Field, Input } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { RoleBadge } from "../../components/ui/Badge.jsx";
import Badge from "../../components/ui/Badge.jsx";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  avatar: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
});

const LimitBar = ({ label, used, limit }) => {
  const pct = percentOf(used, limit);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-500">{label}</span>
        <span className="font-medium text-ink-800">{used} <span className="text-ink-400">/ {limit || "∞"}</span></span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div className={`h-full rounded-full ${pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-amber-400" : "bg-signal"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboardStats });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) reset({ name: user.name || "", avatar: user.avatar || "" });
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (payload) => updateUser(user.id || user._id, payload),
    onSuccess: async (res) => {
      toast.success(res.message || "Profile updated.");
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Profile & Settings</h2>
        <p className="mt-1 text-sm text-ink-400">Manage your personal information and view your usage.</p>
      </div>

      <Card>
        <CardHeader title="Your profile" />
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <CardBody className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} src={user.avatar} size="lg" />
              <div>
                <p className="font-medium text-ink-900">{user.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <RoleBadge role={user.role} label={roleLabel(user.role)} />
                  {user.isVerified && <Badge tone="success"><ShieldCheck className="h-3 w-3" /> Verified</Badge>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name?.message}>
                <Input {...register("name")} />
              </Field>
              <Field label="Avatar URL" error={errors.avatar?.message} hint="Leave blank to use initials.">
                <Input placeholder="https://…" {...register("avatar")} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-lg bg-ink-50 px-3.5 py-2.5 text-sm text-ink-600">
                <Mail className="h-4 w-4 text-ink-400" /> {user.email}
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-ink-50 px-3.5 py-2.5 text-sm text-ink-600">
                <Building2 className="h-4 w-4 text-ink-400" /> Signed in via {user.provider === "GOOGLE" ? "Google" : "Email code"}
              </div>
            </div>
          </CardBody>
          <div className="flex justify-end border-t border-ink-100 px-5 py-4">
            <Button type="submit" isLoading={mutation.isPending}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </div>
        </form>
      </Card>

      {stats && (
        <Card>
          <CardHeader title="Your scan usage" subtitle="Limits are set by your administrator." />
          <CardBody className="space-y-5">
            <LimitBar label="Daily" used={stats.todayScans} limit={stats.limits?.daily} />
            <LimitBar label="Monthly" used={stats.monthlyScans} limit={stats.limits?.monthly} />
            <LimitBar label="Yearly" used={stats.yearlyScans} limit={stats.limits?.yearly} />
          </CardBody>
        </Card>
      )}

      {user.lastLoginAt && (
        <p className="text-center text-xs text-ink-400">Last signed in {formatDate(user.lastLoginAt)}</p>
      )}
    </div>
  );
}

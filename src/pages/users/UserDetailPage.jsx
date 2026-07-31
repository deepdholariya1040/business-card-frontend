import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Trash2, IdCard } from "lucide-react";

import { fetchUserById, updateUser, deleteUser } from "../../services/users.service.js";
import { userEditSchema } from "../../utils/validators.js";
import { getErrorMessage } from "../../lib/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { roleLabel } from "../../config/roles.js";
import { formatDateTime } from "../../utils/format.js";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Field, Input, Checkbox } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { RoleBadge } from "../../components/ui/Badge.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { ErrorState } from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUserById(id),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(userEditSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        avatar: user.avatar || "",
        isActive: user.isActive,
        canManageStaff: user.canManageStaff,
        scanLimits: user.scanLimits || { daily: 25, monthly: 500, yearly: 5000 },
        customLimits: user.customLimits || { enabled: false, daily: 0, monthly: 0, yearly: 0 },
      });
    }
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload) => updateUser(id, payload),
    onSuccess: (res) => {
      toast.success(res.message || "User updated.");
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(id),
    onSuccess: (res) => {
      toast.success(res.message || "User deleted.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/users");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <PageLoader label="Loading user…" />;
  if (isError || !user) return <ErrorState description="This user couldn't be found or you don't have access to them." />;

  return (
    <div className="space-y-5">
      <Link to="/users" className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={user.avatar} size="lg" />
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">{user.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <RoleBadge role={user.role} label={roleLabel(user.role)} />
              <span className="text-sm text-ink-400">{user.email}</span>
            </div>
          </div>
        </div>
        <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="h-4 w-4" /> Delete user
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IdCard} label="Total Cards" value={user.totalCards} accent />
        <StatCard label="Scans Today" value={user.todayScans} />
        <StatCard label="Scans This Month" value={user.monthlyScans} />
        <StatCard label="Scans This Year" value={user.yearlyScans} />
      </div>

      <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Basic info" />
          <CardBody className="space-y-4">
            <Field label="Full name" error={errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field label="Avatar URL" error={errors.avatar?.message} hint="Leave blank to use initials.">
              <Input placeholder="https://…" {...register("avatar")} />
            </Field>
            <Checkbox label="Account active" {...register("isActive")} />
            <Checkbox label="Can manage staff (Company Admin only)" {...register("canManageStaff")} />
            <p className="text-xs text-ink-400">Joined {formatDateTime(user.createdAt)}</p>
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Default scan limits" />
            <CardBody className="grid grid-cols-3 gap-3">
              <Field label="Daily"><Input type="number" min={0} {...register("scanLimits.daily")} /></Field>
              <Field label="Monthly"><Input type="number" min={0} {...register("scanLimits.monthly")} /></Field>
              <Field label="Yearly"><Input type="number" min={0} {...register("scanLimits.yearly")} /></Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Custom limits override" subtitle="When enabled, these values replace the default limits." />
            <CardBody className="space-y-3">
              <Checkbox label="Enable custom limits" {...register("customLimits.enabled")} />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Daily"><Input type="number" min={0} {...register("customLimits.daily")} /></Field>
                <Field label="Monthly"><Input type="number" min={0} {...register("customLimits.monthly")} /></Field>
                <Field label="Yearly"><Input type="number" min={0} {...register("customLimits.yearly")} /></Field>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" isLoading={updateMutation.isPending}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        title="Delete this user?"
        description={`This permanently removes ${user.name}'s account. This cannot be undone.`}
        confirmLabel="Delete user"
      />
    </div>
  );
}

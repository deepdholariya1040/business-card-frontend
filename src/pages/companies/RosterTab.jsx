import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserMinus } from "lucide-react";

import { fetchCompanyUsers } from "../../services/companies.service.js";
import { emailOnlySchema } from "../../utils/validators.js";
import { getErrorMessage } from "../../lib/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Field, Input } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";

export default function RosterTab({
  companyId,
  role,
  seatLimit,
  title,
  subtitle,
  canManage,
  addFn,
  removeFn,
  emptyLabel,
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [pendingRemoval, setPendingRemoval] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["company-users", companyId],
    queryFn: () => fetchCompanyUsers(companyId),
  });

  const roster = (data || []).filter((u) => u.role === role);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(emailOnlySchema),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["company-users", companyId] });

  const addMutation = useMutation({
    mutationFn: (values) => addFn(companyId, values.email),
    onSuccess: (res) => { toast.success(res.message || "Added successfully."); reset(); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: (userId) => removeFn(companyId, userId),
    onSuccess: (res) => { toast.success(res.message || "Removed successfully."); setPendingRemoval(null); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-5">
      {canManage && (
        <Card>
          <CardHeader title={`Add ${title}`} subtitle="The person must already have a registered CardVault account." />
          <form onSubmit={handleSubmit((v) => addMutation.mutate(v))}>
            <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field label="Email address" error={errors.email?.message} className="flex-1">
                <Input type="email" placeholder="person@company.com" {...register("email")} />
              </Field>
              <Button type="submit" isLoading={addMutation.isPending}>
                <UserPlus className="h-4 w-4" /> Add
              </Button>
            </CardBody>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader
          title={subtitle}
          subtitle={typeof seatLimit === "number" ? `${roster.length} of ${seatLimit} seats used` : undefined}
        />
        {isLoading ? (
          <PageLoader label="Loading…" />
        ) : roster.length === 0 ? (
          <EmptyState title={emptyLabel} />
        ) : (
          <div className="divide-y divide-ink-50">
            {roster.map((u) => (
              <div key={u._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={u.name} src={u.avatar} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{u.name}</p>
                    <p className="truncate text-xs text-ink-400">{u.email}</p>
                  </div>
                </div>
                {canManage && (
                  <Button variant="ghost" size="sm" onClick={() => setPendingRemoval(u)}>
                    <UserMinus className="h-4 w-4 text-red-400" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!pendingRemoval}
        onClose={() => setPendingRemoval(null)}
        onConfirm={() => removeMutation.mutate(pendingRemoval._id)}
        isLoading={removeMutation.isPending}
        title={`Remove ${pendingRemoval?.name}?`}
        description="They'll be demoted to Normal User and lose access to this company's data."
        confirmLabel="Remove"
      />
    </div>
  );
}

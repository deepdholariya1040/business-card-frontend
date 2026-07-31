import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Save } from "lucide-react";

import { updateSubscription } from "../../services/companies.service.js";
import { subscriptionSchema } from "../../utils/validators.js";
import { getErrorMessage } from "../../lib/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { canManageCompanyGlobally } from "../../utils/permissions.js";
import { formatDate } from "../../utils/format.js";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Field, Input } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

export default function CompanySubscriptionTab({ company }) {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const canEdit = canManageCompanyGlobally(user);
  const isExpired = company.subscription?.isExpired || new Date(company.subscription?.expiryDate) < new Date();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      startDate: toDateInput(company.subscription?.startDate),
      expiryDate: toDateInput(company.subscription?.expiryDate),
    },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      updateSubscription(company._id, {
        startDate: values.startDate || undefined,
        expiryDate: values.expiryDate,
      }),
    onSuccess: (res) => {
      toast.success(res.message || "Subscription updated.");
      queryClient.invalidateQueries({ queryKey: ["company", company._id] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader
          title="Subscription"
          subtitle="Controls when this company's access expires."
          action={<Badge tone={isExpired ? "danger" : "success"}>{isExpired ? "Expired" : "Active"}</Badge>}
        />
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-ink-50 px-3.5 py-2.5 text-sm text-ink-600">
              <CalendarClock className="h-4 w-4 text-ink-400" />
              Current expiry: <span className="font-medium text-ink-900">{formatDate(company.subscription?.expiryDate)}</span>
            </div>
            <Field label="Start date" error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} disabled={!canEdit} />
            </Field>
            <Field label="Expiry date" error={errors.expiryDate?.message} required>
              <Input type="date" {...register("expiryDate")} disabled={!canEdit} />
            </Field>
          </CardBody>
          {canEdit && (
            <div className="flex justify-end border-t border-ink-100 px-5 py-4">
              <Button type="submit" isLoading={mutation.isPending}>
                <Save className="h-4 w-4" /> Update subscription
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}

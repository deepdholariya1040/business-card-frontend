import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, ShieldOff, ShieldCheck, UserCog } from "lucide-react";

import {
  updateCompany,
  deactivateCompany,
  recoverCompany,
  changeMainAdmin,
} from "../../services/companies.service.js";
import { companyEditSchema, emailOnlySchema } from "../../utils/validators.js";
import { getErrorMessage } from "../../lib/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { canManageCompanyGlobally } from "../../utils/permissions.js";
import { useAuth } from "../../hooks/useAuth.js";
import { formatDate } from "../../utils/format.js";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Field, Input } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import Modal from "../../components/ui/Modal.jsx";

export default function CompanyOverviewTab({ company }) {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [changeAdminOpen, setChangeAdminOpen] = useState(false);
  const isSuperAdmin = canManageCompanyGlobally(user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companyEditSchema),
  });

  useEffect(() => {
    reset({
      name: company.name,
      maxCompanyAdmins: company.maxCompanyAdmins,
      maxStaff: company.maxStaff,
      scanLimits: company.scanLimits,
    });
  }, [company, reset]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["company", company._id] });
    queryClient.invalidateQueries({ queryKey: ["companies"] });
    queryClient.invalidateQueries({ queryKey: ["companies-search"] });
  };

  const updateMutation = useMutation({
    mutationFn: (payload) => updateCompany(company._id, payload),
    onSuccess: (res) => {
      toast.success(res.message || "Company updated.");
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateCompany(company._id),
    onSuccess: (res) => {
      toast.success(res.message || "Company deactivated.");
      setConfirmOpen(false);
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const recoverMutation = useMutation({
    mutationFn: () => recoverCompany(company._id),
    onSuccess: (res) => {
      toast.success(res.message || "Company recovered.");
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const {
    register: registerAdmin,
    handleSubmit: handleAdminSubmit,
    formState: { errors: adminErrors },
    reset: resetAdminForm,
  } = useForm({ resolver: zodResolver(emailOnlySchema) });

  const changeAdminMutation = useMutation({
    mutationFn: (values) => changeMainAdmin(company._id, values.email),
    onSuccess: (res) => {
      toast.success(res.message || "Main Admin changed.");
      setChangeAdminOpen(false);
      resetAdminForm();
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <form
        onSubmit={handleSubmit((v) => updateMutation.mutate(v))}
        className="space-y-5 lg:col-span-2"
      >
        <Card>
          <CardHeader title="Company details" />
          <CardBody className="space-y-4">
            <Field label="Company name" error={errors.name?.message}>
              <Input {...register("name")} disabled={!isSuperAdmin} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Max company admins"
                error={errors.maxCompanyAdmins?.message}
              >
                <Input
                  type="number"
                  min={1}
                  {...register("maxCompanyAdmins")}
                  disabled={!isSuperAdmin}
                />
              </Field>
              <Field label="Max staff" error={errors.maxStaff?.message}>
                <Input
                  type="number"
                  min={1}
                  {...register("maxStaff")}
                  disabled={!isSuperAdmin}
                />
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Company-wide scan limits" />
          <CardBody className="grid grid-cols-3 gap-3">
            <Field label="Daily">
              <Input
                type="number"
                min={0}
                {...register("scanLimits.daily")}
                disabled={!isSuperAdmin}
              />
            </Field>
            <Field label="Monthly">
              <Input
                type="number"
                min={0}
                {...register("scanLimits.monthly")}
                disabled={!isSuperAdmin}
              />
            </Field>
            <Field label="Yearly">
              <Input
                type="number"
                min={0}
                {...register("scanLimits.yearly")}
                disabled={!isSuperAdmin}
              />
            </Field>
          </CardBody>
          {isSuperAdmin && (
            <div className="flex justify-end border-t border-ink-100 px-5 py-4">
              <Button type="submit" isLoading={updateMutation.isPending}>
                <Save className="h-4 w-4" /> Save changes
              </Button>
            </div>
          )}
        </Card>
      </form>

      <div className="space-y-5">
        <Card>
          <CardHeader title="Status" />
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-400">Account status</span>
              <Badge tone={company.isActive ? "success" : "danger"}>
                {company.isActive ? "Active" : "Blocked"}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-400">Daily</span>
                <span className="font-medium text-ink-800">
                  {company.scanUsage?.daily ?? 0} /{" "}
                  {company.scanLimits?.daily ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-400">Monthly</span>
                <span className="font-medium text-ink-800">
                  {company.scanUsage?.monthly ?? 0} /{" "}
                  {company.scanLimits?.monthly ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-400">Yearly</span>
                <span className="font-medium text-ink-800">
                  {company.scanUsage?.yearly ?? 0} /{" "}
                  {company.scanLimits?.yearly ?? 0}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-400">Created</span>
              <span className="text-ink-700">
                {formatDate(company.createdAt)}
              </span>
            </div>
          </CardBody>
          {isSuperAdmin && (
            <div className="space-y-2 border-t border-ink-100 p-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setChangeAdminOpen(true)}
              >
                <UserCog className="h-4 w-4" /> Change Main Admin
              </Button>
              {company.isActive ? (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setConfirmOpen(true)}
                >
                  <ShieldOff className="h-4 w-4" /> Deactivate company
                </Button>
              ) : (
                <Button
                  variant="signal"
                  className="w-full"
                  isLoading={recoverMutation.isPending}
                  onClick={() => recoverMutation.mutate()}
                >
                  <ShieldCheck className="h-4 w-4" /> Recover company
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deactivateMutation.mutate()}
        isLoading={deactivateMutation.isPending}
        title="Deactivate this company?"
        description="This blocks the company and demotes all of its admins and staff to Normal User. It can be recovered later."
        confirmLabel="Deactivate"
      />

      <Modal
        open={changeAdminOpen}
        onClose={() => setChangeAdminOpen(false)}
        title="Change Main Company Admin"
        footer={
          <>
            <Button variant="outline" onClick={() => setChangeAdminOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdminSubmit((v) => changeAdminMutation.mutate(v))}
              isLoading={changeAdminMutation.isPending}
            >
              Change admin
            </Button>
          </>
        }
      >
        <Field
          label="New Main Admin's email"
          error={adminErrors.email?.message}
          required
        >
          <Input
            type="email"
            placeholder="newadmin@company.com"
            {...registerAdmin("email")}
          />
        </Field>
      </Modal>
    </div>
  );
}

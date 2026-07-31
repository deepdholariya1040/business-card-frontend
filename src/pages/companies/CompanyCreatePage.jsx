import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Building2 } from "lucide-react";

import { createCompany } from "../../services/companies.service.js";
import { companyCreateSchema } from "../../utils/validators.js";
import { getErrorMessage } from "../../lib/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Field, Input } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";

export default function CompanyCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(companyCreateSchema),
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      createCompany({
        name: values.name,
        mainAdminEmail: values.mainAdminEmail,
        maxCompanyAdmins: values.maxCompanyAdmins || undefined,
        maxStaff: values.maxStaff || undefined,
        subscription: { expiryDate: values.expiryDate },
      }),
    onSuccess: (res) => {
      toast.success(res.message || "Company created.");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies-search"] });
      navigate(`/companies/${res.data._id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link to="/companies" className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="h-4 w-4" /> Back to companies
      </Link>

      <Card>
        <CardHeader
          title="Onboard a new company"
          subtitle="The Main Admin's email must already belong to a registered user account."
        />
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <CardBody className="space-y-4">
            <Field label="Company name" error={errors.name?.message} required>
              <Input placeholder="Acme Corporation" {...register("name")} />
            </Field>
            <Field
              label="Main Admin email"
              error={errors.mainAdminEmail?.message}
              required
              hint="This user will be promoted to Main Company Admin."
            >
              <Input type="email" placeholder="admin@acme.com" {...register("mainAdminEmail")} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Max company admins" error={errors.maxCompanyAdmins?.message} hint="Default: 5">
                <Input type="number" min={1} placeholder="5" {...register("maxCompanyAdmins")} />
              </Field>
              <Field label="Max staff" error={errors.maxStaff?.message} hint="Default: 50">
                <Input type="number" min={1} placeholder="50" {...register("maxStaff")} />
              </Field>
            </div>
            <Field label="Subscription expiry date" error={errors.expiryDate?.message} required>
              <Input type="date" {...register("expiryDate")} />
            </Field>
          </CardBody>
          <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-4">
            <Link to="/companies">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" isLoading={mutation.isPending}>
              <Building2 className="h-4 w-4" /> Create company
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

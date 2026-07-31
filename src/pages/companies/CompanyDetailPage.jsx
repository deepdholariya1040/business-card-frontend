import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import {
  fetchCompanyById,
  addCompanyAdmin,
  removeCompanyAdmin,
  addStaff,
  removeStaff,
} from "../../services/companies.service.js";
import { useAuth } from "../../hooks/useAuth.js";
import { ROLES } from "../../config/roles.js";
import {
  canManageCompanyGlobally,
  canManageCompanyAdmins,
  canManageStaffRoster,
} from "../../utils/permissions.js";
import Tabs from "../../components/ui/Tabs.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { ErrorState } from "../../components/ui/EmptyState.jsx";

import CompanyOverviewTab from "./CompanyOverviewTab.jsx";
import RosterTab from "./RosterTab.jsx";
import CompanyUsersTab from "./CompanyUsersTab.jsx";
import CompanySubscriptionTab from "./CompanySubscriptionTab.jsx";

export default function CompanyDetailPage() {
  const { id } = useParams();

  console.log("ID =", id);
  console.log("TYPE =", typeof id);
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");

  const {
    data: company,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["company", id],
    queryFn: () => fetchCompanyById(id),
  });

  if (isLoading) return <PageLoader label="Loading company…" />;
  if (isError || !company)
    return (
      <ErrorState description="This company couldn't be found or you don't have access to it." />
    );

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "admins", label: "Company Admins" },
    { value: "staff", label: "Staff" },
    { value: "members", label: "All Members" },
    ...(canManageCompanyGlobally(user)
      ? [{ value: "subscription", label: "Subscription" }]
      : []),
  ];

  return (
    <div className="space-y-5">
      <Link
        to="/companies"
        className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to companies
      </Link>

      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">
          {company.name}
        </h2>
        <p className="mt-1 text-sm text-ink-400">
          Manage this company's admins, staff, and subscription.
        </p>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="pt-1">
        {tab === "overview" && <CompanyOverviewTab company={company} />}
        {tab === "admins" && (
          <RosterTab
            companyId={id}
            role={ROLES.COMPANY_ADMIN}
            seatLimit={company.maxCompanyAdmins}
            title="Company Admin"
            subtitle="Company Admins"
            emptyLabel="No Company Admins yet."
            canManage={canManageCompanyAdmins(user)}
            addFn={addCompanyAdmin}
            removeFn={removeCompanyAdmin}
          />
        )}
        {tab === "staff" && (
          <RosterTab
            companyId={id}
            role={ROLES.STAFF}
            seatLimit={company.maxStaff}
            title="Staff Member"
            subtitle="Staff"
            emptyLabel="No staff members yet."
            canManage={canManageStaffRoster(user)}
            addFn={addStaff}
            removeFn={removeStaff}
          />
        )}
        {tab === "members" && <CompanyUsersTab companyId={id} />}
        {tab === "subscription" && canManageCompanyGlobally(user) && (
          <CompanySubscriptionTab company={company} />
        )}
      </div>
    </div>
  );
}

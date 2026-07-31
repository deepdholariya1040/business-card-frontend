import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { IdCard, Users, Building2, ScanLine, TrendingUp, ArrowUpRight } from "lucide-react";

import { fetchDashboardStats } from "../services/dashboard.service.js";
import { useAuth } from "../hooks/useAuth.js";
import { roleLabel } from "../config/roles.js";
import { hasCompanyScope, isSuperAdmin } from "../utils/permissions.js";
import { percentOf } from "../utils/format.js";
import StatCard from "../components/ui/StatCard.jsx";
import Card, { CardBody, CardHeader } from "../components/ui/Card.jsx";
import { PageLoader } from "../components/ui/Spinner.jsx";
import { ErrorState } from "../components/ui/EmptyState.jsx";
import Button from "../components/ui/Button.jsx";

const LimitBar = ({ label, used, limit }) => {
  const pct = percentOf(used, limit);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-500">{label}</span>
        <span className="font-medium text-ink-800">
          {used} <span className="text-ink-400">/ {limit || "∞"}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-amber-400" : "bg-signal"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <PageLoader label="Loading your dashboard…" />;
  if (isError) return <ErrorState description="We couldn't load your dashboard stats. Try refreshing." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            Welcome back, {user?.name?.split(" ")[0]}
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            You're signed in as {roleLabel(user?.role)}
            {hasCompanyScope(user) && " within your company workspace"}.
          </p>
        </div>
        <Link to="/scan">
          <Button variant="signal">
            <ScanLine className="h-4 w-4" /> Scan a new card
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IdCard} label="Total Cards" value={data.totalCards} accent />
        <StatCard icon={TrendingUp} label="Scans Today" value={data.todayScans} hint="resets at midnight" />
        <StatCard icon={Users} label={isSuperAdmin(user) ? "Total Users" : "Team Members"} value={data.totalUsers} />
        {isSuperAdmin(user) ? (
          <StatCard icon={Building2} label="Total Companies" value={data.totalCompanies} />
        ) : (
          <StatCard icon={IdCard} label="Scans This Month" value={data.monthlyScans} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Scan usage" subtitle="Limits reset daily, monthly, and yearly." />
          <CardBody className="space-y-5">
            <LimitBar label="Daily" used={data.todayScans} limit={data.limits?.daily} />
            <LimitBar label="Monthly" used={data.monthlyScans} limit={data.limits?.monthly} />
            <LimitBar label="Yearly" used={data.yearlyScans} limit={data.limits?.yearly} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Quick links" />
          <CardBody className="space-y-2">
            <Link
              to="/business-cards"
              className="flex items-center justify-between rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm font-medium text-ink-700 hover:border-ink-200 hover:bg-ink-50"
            >
              View business cards <ArrowUpRight className="h-4 w-4 text-ink-300" />
            </Link>
            {hasCompanyScope(user) && (
              <Link
                to="/companies"
                className="flex items-center justify-between rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm font-medium text-ink-700 hover:border-ink-200 hover:bg-ink-50"
              >
                Manage company <ArrowUpRight className="h-4 w-4 text-ink-300" />
              </Link>
            )}
            {isSuperAdmin(user) && (
              <Link
                to="/companies/new"
                className="flex items-center justify-between rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm font-medium text-ink-700 hover:border-ink-200 hover:bg-ink-50"
              >
                Onboard a new company <ArrowUpRight className="h-4 w-4 text-ink-300" />
              </Link>
            )}
            <Link
              to="/profile"
              className="flex items-center justify-between rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm font-medium text-ink-700 hover:border-ink-200 hover:bg-ink-50"
            >
              Update your profile <ArrowUpRight className="h-4 w-4 text-ink-300" />
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

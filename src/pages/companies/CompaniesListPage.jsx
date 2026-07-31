import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Building2, Plus } from "lucide-react";

import { fetchCompanies, searchCompanies, fetchCompanyStats } from "../../services/companies.service.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { usePagination } from "../../hooks/usePagination.js";
import { canCreateCompany, canManageCompanyGlobally } from "../../utils/permissions.js";
import { formatDate } from "../../utils/format.js";
import Card from "../../components/ui/Card.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { EmptyState, ErrorState } from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

const statusTone = { active: "success", blocked: "danger", expired: "warning" };

export default function CompaniesListPage() {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const debouncedKeyword = useDebounce(keyword);
  const isSuperAdminScope = canManageCompanyGlobally(user);

  const { data, isLoading, isError } = useQuery({
    queryKey: isSuperAdminScope ? ["companies-search", debouncedKeyword, status] : ["companies"],
    queryFn: () =>
      isSuperAdminScope
        ? searchCompanies({ keyword: debouncedKeyword || undefined, status: status || undefined })
        : fetchCompanies(),
  });

  const { data: stats } = useQuery({
    queryKey: ["company-stats"],
    queryFn: fetchCompanyStats,
    enabled: isSuperAdminScope,
  });

  const { pageItems, page, setPage, totalPages, total } = usePagination(data || [], 9);

  const companyStatus = (company) => {
    if (!company.isActive) return "blocked";
    if (company.subscription?.isExpired || new Date(company.subscription?.expiryDate) < new Date()) return "expired";
    return "active";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Companies</h2>
          <p className="mt-1 text-sm text-ink-400">
            {isSuperAdminScope ? "Every tenant on the platform." : "Your company workspace."}
          </p>
        </div>
        {canCreateCompany(user) && (
          <Link to="/companies/new">
            <Button>
              <Plus className="h-4 w-4" /> New company
            </Button>
          </Link>
        )}
      </div>

      {isSuperAdminScope && stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total" value={stats.totalCompanies} accent />
          <StatCard label="Active" value={stats.activeCompanies} />
          <StatCard label="Blocked" value={stats.blockedCompanies} />
          <StatCard label="Expired" value={stats.expiredCompanies} />
        </div>
      )}

      {isSuperAdminScope && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search by name or admin email…" className="pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-48">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="expired">Expired</option>
          </Select>
        </div>
      )}

      <Card>
        {isLoading ? (
          <PageLoader label="Loading companies…" />
        ) : isError ? (
          <ErrorState description="We couldn't load companies." />
        ) : total === 0 ? (
          <EmptyState icon={Building2} title="No companies found." description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((company) => (
                <Link
                  key={company._id}
                  to={`/companies/${company._id}`}
                  className="flex flex-col gap-3 rounded-xl border border-ink-100 p-4 transition-all hover:border-signal/40 hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900/5 text-ink-600">
                      <Building2 className="h-4.5 w-4.5" />
                    </div>
                    <Badge tone={statusTone[companyStatus(company)]}>{companyStatus(company)}</Badge>
                  </div>
                  <div>
                    <p className="truncate font-medium text-ink-900">{company.name}</p>
                    <p className="text-xs text-ink-400">Renews {formatDate(company.subscription?.expiryDate)}</p>
                  </div>
                  <div className="mt-1 flex gap-4 border-t border-ink-100 pt-2.5 text-xs text-ink-500">
                    <span>{company.maxCompanyAdmins} admin seats</span>
                    <span>{company.maxStaff} staff seats</span>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} />
          </>
        )}
      </Card>
    </div>
  );
}

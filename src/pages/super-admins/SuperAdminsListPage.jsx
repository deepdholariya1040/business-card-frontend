import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, ShieldCheck } from "lucide-react";

import { fetchSuperAdmins } from "../../services/users.service.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { usePagination } from "../../hooks/usePagination.js";
import { roleLabel } from "../../config/roles.js";

import Card from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { RoleBadge } from "../../components/ui/Badge.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import {
  EmptyState,
  ErrorState,
} from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

export default function SuperAdminsListPage() {
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["super-admins"],
    queryFn: fetchSuperAdmins,
  });

  const filtered = (data || []).filter(
    (u) =>
      !debouncedSearch ||
      u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const { pageItems, page, setPage, totalPages, total } =
    usePagination(filtered, 10);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            Super Admins
          </h2>

          <p className="mt-1 text-sm text-ink-400">
            Manage all Super Admin accounts on the platform.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-9"
        />
      </div>

      <Card>
        {isLoading ? (
          <PageLoader label="Loading Super Admins..." />
        ) : isError ? (
          <ErrorState description="We couldn't load Super Admins." />
        ) : total === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No Super Admins found."
            description="No Super Admin accounts match your search."
          />
        ) : (
          <>
            <div className="divide-y divide-ink-50">
              {pageItems.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-ink-50/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      name={u.name}
                      src={u.avatar}
                      size="sm"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {u.name}
                      </p>

                      <p className="truncate text-xs text-ink-400">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <RoleBadge
                      role={u.role}
                      label={roleLabel(u.role)}
                    />

                    {!u.isActive && (
                      <span className="text-xs font-medium text-red-500">
                        Inactive
                      </span>
                    )}

                    <Link to={`/users/${u._id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </Link>

                    <Link
                      to={`/business-cards?createdBy=${u._id}`}
                    >
                      <Button size="sm">
                        View Cards
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              total={total}
            />
          </>
        )}
      </Card>
    </div>
  );
}
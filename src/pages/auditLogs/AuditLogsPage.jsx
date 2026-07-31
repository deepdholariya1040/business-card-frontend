import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollText, Search } from "lucide-react";

import { fetchAuditLogs } from "../../services/auditLogs.service.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { usePagination } from "../../hooks/usePagination.js";
import { formatDateTime } from "../../utils/format.js";
import { roleLabel } from "../../config/roles.js";
import Card from "../../components/ui/Card.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { RoleBadge } from "../../components/ui/Badge.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { EmptyState, ErrorState } from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: fetchAuditLogs,
  });

  const actions = useMemo(() => [...new Set((data || []).map((l) => l.action))].sort(), [data]);

  const filtered = (data || []).filter((log) => {
    const matchesSearch =
      !debouncedSearch ||
      log.actorId?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      log.actorId?.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      log.action?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesAction = !action || log.action === action;
    return matchesSearch && matchesAction;
  });

  const { pageItems, page, setPage, totalPages, total } = usePagination(filtered, 15);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Audit Logs</h2>
        <p className="mt-1 text-sm text-ink-400">A record of every sensitive action taken in your scope.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by actor or action…" className="pl-9" />
        </div>
        <Select value={action} onChange={(e) => setAction(e.target.value)} className="sm:w-56">
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>{a.replaceAll("_", " ")}</option>
          ))}
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <PageLoader label="Loading audit logs…" />
        ) : isError ? (
          <ErrorState description="We couldn't load audit logs." />
        ) : total === 0 ? (
          <EmptyState icon={ScrollText} title="No matching audit logs." />
        ) : (
          <>
            <div className="divide-y divide-ink-50">
              {pageItems.map((log) => (
                <div key={log._id} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={log.actorId?.name || "?"} size="sm" />
                    <div>
                      <p className="text-sm text-ink-800">
                        <span className="font-medium">{log.actorId?.name || "Unknown actor"}</span>{" "}
                        <span className="text-ink-400">({log.actorId?.email || "—"})</span>
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <RoleBadge role={log.actorRole} label={roleLabel(log.actorRole)} />
                        <span className="font-mono text-xs text-ink-500">{log.action}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pl-11 text-xs text-ink-400 sm:pl-0 sm:text-right">
                    <p>{formatDateTime(log.createdAt)}</p>
                    {log.ip && <p className="font-mono">{log.ip}</p>}
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} />
          </>
        )}
      </Card>
    </div>
  );
}

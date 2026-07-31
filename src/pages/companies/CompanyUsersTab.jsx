import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchCompanyUsers,
  changeUserRole,
} from "../../services/companies.service.js";
import { getErrorMessage } from "../../lib/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { ROLES, roleLabel } from "../../config/roles.js";
import {
  canManageCompanyGlobally,
  isMainCompanyAdmin,
} from "../../utils/permissions.js";
import Card from "../../components/ui/Card.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { RoleBadge } from "../../components/ui/Badge.jsx";
import { Select } from "../../components/ui/Input.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";

export default function CompanyUsersTab({ companyId }) {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const canChangeRole =
    canManageCompanyGlobally(user) || isMainCompanyAdmin(user);

  // Roles based on logged-in user
  const assignableRoles = canManageCompanyGlobally(user)
    ? [
        ROLES.MAIN_COMPANY_ADMIN,
        ROLES.COMPANY_ADMIN,
        ROLES.STAFF,
      ]
    : isMainCompanyAdmin(user)
    ? [
        ROLES.COMPANY_ADMIN,
        ROLES.STAFF,
      ]
    : [];

  const { data, isLoading } = useQuery({
    queryKey: ["company-users", companyId],
    queryFn: () => fetchCompanyUsers(companyId),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) =>
      changeUserRole(companyId, userId, role),

    onSuccess: (res) => {
      toast.success(res.message || "Role updated.");

      queryClient.invalidateQueries({
        queryKey: ["company-users", companyId],
      });
    },

    onError: (err) =>
      toast.error(getErrorMessage(err)),
  });

  return (
    <Card>
      {isLoading ? (
        <PageLoader label="Loading members…" />
      ) : !data?.length ? (
        <EmptyState title="No company members yet." />
      ) : (
        <div className="divide-y divide-ink-50">
          {data.map((u) => {
            const isSelf = String(u._id) === String(user?._id);

            return (
              <div
                key={u._id}
                className="flex items-center justify-between gap-4 px-5 py-3.5"
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

                <div className="flex shrink-0 items-center gap-2">
                  {!u.isActive && (
                    <span className="text-xs font-medium text-red-500">
                      Inactive
                    </span>
                  )}

                  {/* Hide role controls for self */}
                  {!isSelf &&
                  canChangeRole ? (
                    <Select
                      value={u.role}
                      className="h-8 w-44 text-xs"
                      onChange={(e) =>
                        roleMutation.mutate({
                          userId: u._id,
                          role: e.target.value,
                        })
                      }
                    >
                      {assignableRoles.map((role) => (
                        <option
                          key={role}
                          value={role}
                        >
                          {roleLabel(role)}
                        </option>
                      ))}
                    </Select>
                  ) : !isSelf ? (
                    <RoleBadge
                      role={u.role}
                      label={roleLabel(u.role)}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
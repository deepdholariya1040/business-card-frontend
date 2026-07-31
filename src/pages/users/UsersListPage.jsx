import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, UserPlus, Users as UsersIcon } from "lucide-react";

import { fetchUsers, createUser } from "../../services/users.service.js";
import { userFormSchema } from "../../utils/validators.js";
import { getErrorMessage } from "../../lib/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { usePagination } from "../../hooks/usePagination.js";
import {
  CREATABLE_ROLE_BY_CREATOR,
  roleLabel,
  ROLES,
} from "../../config/roles.js";
import Card from "../../components/ui/Card.jsx";
import { Input, Field } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { RoleBadge } from "../../components/ui/Badge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import {
  EmptyState,
  ErrorState,
} from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

export default function UsersListPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const filtered = (data || []).filter(
    (u) =>
      !debouncedSearch ||
      u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const { pageItems, page, setPage, totalPages, total } = usePagination(
    filtered,
    10
  );

  const rawCreatableRole =
    CREATABLE_ROLE_BY_CREATOR[currentUser?.role];

  const creatableRole =
    currentUser?.role === ROLES.COMPANY_ADMIN &&
    !currentUser?.canManageStaff
      ? null
      : rawCreatableRole;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (values) =>
      createUser({
        name: values.name,
        email: values.email,
        role: creatableRole,
        ...(currentUser?.role !== "SUPER_ADMIN"
          ? { companyId: currentUser?.companyId }
          : {}),
      }),
    onSuccess: (res) => {
      toast.success(res.message || "User created.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            Users
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            Directory of normal (unaffiliated) user accounts on the
            platform.
          </p>
        </div>

        {creatableRole && (
          <Button onClick={() => setModalOpen(true)}>
            <UserPlus className="h-4 w-4" />
            {" "}
            New {roleLabel(creatableRole)}
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="pl-9"
        />
      </div>

      <Card>
        {isLoading ? (
          <PageLoader label="Loading users…" />
        ) : isError ? (
          <ErrorState description="We couldn't load users." />
        ) : total === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No users found."
            description="No normal user accounts match your search."
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Create ${roleLabel(creatableRole)}`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit((v) =>
                createMutation.mutate(v)
              )}
              isLoading={createMutation.isPending}
            >
              Create
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Field
            label="Full name"
            error={errors.name?.message}
            required
          >
            <Input {...register("name")} />
          </Field>

          <Field
            label="Email address"
            error={errors.email?.message}
            required
          >
            <Input
              type="email"
              {...register("email")}
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
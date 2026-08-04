import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  IdCard,
  ScanLine,
  Mail,
  Phone,
  Building2,
  X,
} from "lucide-react";

import { fetchBusinessCards } from "../../services/businessCards.service.js";
import {
  fetchCompanies,
  fetchBusinessCardUsers,
} from "../../services/companies.service.js";

import { useAuthContext } from "../../context/AuthContext.jsx";

import { useDebounce } from "../../hooks/useDebounce.js";
import { usePagination } from "../../hooks/usePagination.js";
import { formatDate } from "../../utils/format.js";

import Card from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { EmptyState, ErrorState } from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

export default function BusinessCardsListPage() {
  const { user } = useAuthContext();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * URL Filter
   * /business-cards?createdBy=<userId>
   */
  const createdByFromUrl = searchParams.get("createdBy") || "";

  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedMember, setSelectedMember] = useState("");

  const debouncedSearch = useDebounce(search);

  /**
   * Companies
   */
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    enabled: user?.role === "SUPER_ADMIN",
  });

  /**
   * Members
   */
  const { data: members = [] } = useQuery({
    queryKey: ["business-card-users", selectedCompany, selectedRole],
    queryFn: () =>
      fetchBusinessCardUsers({
        companyId: selectedCompany,
        role: selectedRole,
      }),
    enabled: ["SUPER_ADMIN", "MAIN_COMPANY_ADMIN", "COMPANY_ADMIN"].includes(
      user?.role,
    ),
  });

  /**
   * Business Cards
   *
   * URL createdBy filter has higher priority
   * than Member dropdown.
   */
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "business-cards",
      debouncedSearch,
      selectedCompany,
      selectedRole,
      selectedMember,
      createdByFromUrl,
    ],
    queryFn: async () => {
      const result = await fetchBusinessCards(
        debouncedSearch,
        selectedCompany,
        selectedRole,
        createdByFromUrl || selectedMember,
      );

      console.log("URL createdBy:", createdByFromUrl);
      console.log("API RESULT:", result);

      return result;
    },
  });

  const { pageItems, page, setPage, totalPages, total } = usePagination(
    data,
    12,
  );

  /**
   * Clear URL filter
   */
  const handleClearCreatedByFilter = () => {
    searchParams.delete("createdBy");
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            Business Cards
          </h2>

          <p className="mt-1 text-sm text-ink-400">
            Every contact scanned, in one searchable place.
          </p>
        </div>

        <Link to="/scan">
          <Button variant="signal">
            <ScanLine className="h-4 w-4" />
            Scan a card
          </Button>
        </Link>
      </div>

      {/* URL Filter Info */}
      {createdByFromUrl && (
        <Card className="border-signal/20 bg-signal/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge tone="signal">Showing cards for selected user</Badge>

              <span className="text-sm text-ink-500">
                Business cards are currently filtered by the selected user.
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCreatedByFilter}
            >
              <X className="h-4 w-4" />
              Clear Filter
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[350px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />

          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, company, email, phone..."
            className="pl-9"
          />
        </div>

        {/* Company Filter */}
        {user?.role === "SUPER_ADMIN" && (
          <select
            value={selectedCompany}
            onChange={(e) => {
              setSelectedCompany(e.target.value);
              setSelectedRole("");
              setSelectedMember("");
              setPage(1);
            }}
            className="w-60 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 outline-none focus:border-signal"
          >
            <option value="">All Companies</option>

            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </select>
        )}

        {/* Role Filter */}
        {(user?.role === "SUPER_ADMIN" ||
          user?.role === "MAIN_COMPANY_ADMIN" ||
          user?.role === "COMPANY_ADMIN") && (
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setSelectedMember("");
              setPage(1);
            }}
            className="w-52 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 outline-none focus:border-signal"
          >
            <option value="">All Roles</option>

            {user?.role === "SUPER_ADMIN" && (
              <>
                <option value="MAIN_COMPANY_ADMIN">Main Company Admin</option>

                <option value="COMPANY_ADMIN">Company Admin</option>

                <option value="STAFF">Staff</option>
              </>
            )}

            {user?.role === "MAIN_COMPANY_ADMIN" && (
              <>
                <option value="COMPANY_ADMIN">Company Admin</option>

                <option value="STAFF">Staff</option>
              </>
            )}

            {user?.role === "COMPANY_ADMIN" && (
              <option value="STAFF">Staff</option>
            )}
          </select>
        )}

        {/* Member Filter */}
        {(user?.role === "SUPER_ADMIN" ||
          user?.role === "MAIN_COMPANY_ADMIN" ||
          user?.role === "COMPANY_ADMIN") && (
          <select
            value={selectedMember}
            onChange={(e) => {
              setSelectedMember(e.target.value);
              setPage(1);
            }}
            className="w-60 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 outline-none focus:border-signal"
          >
            <option value="">All Members</option>

            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name || member.email} ({member.role})
              </option>
            ))}
          </select>
        )}
      </div>

      <Card>
        {isLoading ? (
          <PageLoader label="Loading business cards..." />
        ) : isError ? (
          <ErrorState description="We couldn't load business cards. Try again shortly." />
        ) : total === 0 ? (
          <EmptyState
            icon={IdCard}
            title={
              search
                ? "No cards match your search."
                : createdByFromUrl
                  ? "No business cards found."
                  : "No business cards yet."
            }
            description={
              search
                ? "Try a different name, company, or contact detail."
                : createdByFromUrl
                  ? "The selected user hasn't scanned any business cards yet."
                  : "Scan your first business card to get started."
            }
            action={
              !search &&
              !createdByFromUrl && (
                <Link to="/scan">
                  <Button variant="signal" size="sm">
                    <ScanLine className="h-4 w-4" />
                    Scan a card
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((card) => (
                <Link
                  key={card._id}
                  to={`/business-cards/${card._id}`}
                  className="group flex flex-col gap-3 rounded-xl border border-ink-100 p-4 transition-all hover:border-signal/40 hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {card.frontImageUrl ? (
                        <img
                          src={card.frontImageUrl}
                          alt=""
                          className="h-12 w-16 shrink-0 rounded-md border border-ink-100 object-cover"
                        />
                      ) : (
                        <Avatar name={card.parsedData?.name || "?"} />
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-900">
                          {card.parsedData?.name || "Unnamed contact"}
                        </p>

                        <p className="truncate text-xs text-ink-400">
                          {card.parsedData?.designation || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {card.parsedData?.company && (
                    <div className="flex items-center gap-1.5 text-xs text-ink-500">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-ink-300" />
                      <span className="truncate">
                        {card.parsedData.company}
                      </span>
                    </div>
                  )}

                  {card.parsedData?.email && (
                    <div className="flex items-center gap-1.5 text-xs text-ink-500">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-ink-300" />
                      <span className="truncate">{card.parsedData.email}</span>
                    </div>
                  )}

                  {card.parsedData?.phones?.[0] && (
                    <div className="flex items-center gap-1.5 text-xs text-ink-500">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-ink-300" />
                      <span className="truncate">
                        {card.parsedData.phones[0]}
                      </span>
                    </div>
                  )}
                  <div className="mt-1 flex items-center justify-between border-t border-ink-100 pt-2.5">
                    <span className="text-[11px] text-ink-400">
                      {formatDate(card.createdAt)}
                    </span>

                    {(card.qrCodes?.length > 0 ||
                      card.barcodes?.length > 0) && (
                      <Badge tone="signal">
                        {(card.qrCodes?.length || 0) +
                          (card.barcodes?.length || 0)}{" "}
                        code(s)
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}

import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import RequireAuth from "./components/layout/RequireAuth.jsx";
import RequireRole from "./components/layout/RequireRole.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import { PageLoader } from "./components/ui/Spinner.jsx";
import { ROLES } from "./config/roles.js";

const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage.jsx"));

const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));

const ScanPage = lazy(() => import("./pages/scan/ScanPage.jsx"));

const BusinessCardsListPage = lazy(() =>
  import("./pages/businessCards/BusinessCardsListPage.jsx")
);
const BusinessCardDetailPage = lazy(() =>
  import("./pages/businessCards/BusinessCardDetailPage.jsx")
);
const BusinessCardEditPage = lazy(() =>
  import("./pages/businessCards/BusinessCardEditPage.jsx")
);

const CompaniesListPage = lazy(() =>
  import("./pages/companies/CompaniesListPage.jsx")
);
const CompanyDetailPage = lazy(() =>
  import("./pages/companies/CompanyDetailPage.jsx")
);
const CompanyCreatePage = lazy(() =>
  import("./pages/companies/CompanyCreatePage.jsx")
);

const UsersListPage = lazy(() =>
  import("./pages/users/UsersListPage.jsx")
);
const UserDetailPage = lazy(() =>
  import("./pages/users/UserDetailPage.jsx")
);

const SuperAdminsListPage = lazy(() =>
  import("./pages/super-admins/SuperAdminsListPage.jsx")
);

const AuditLogsPage = lazy(() =>
  import("./pages/auditLogs/AuditLogsPage.jsx")
);

const ProfilePage = lazy(() =>
  import("./pages/profile/ProfilePage.jsx")
);

const ForbiddenPage = lazy(() =>
  import("./pages/ForbiddenPage.jsx")
);

const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage.jsx")
);

const {
  SUPER_ADMIN,
  MAIN_COMPANY_ADMIN,
  COMPANY_ADMIN,
} = ROLES;

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-canvas">
          <PageLoader />
        </div>
      }
    >
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forbidden"
          element={<ForbiddenPage />}
        />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            {/* Scan */}
            <Route
              path="/scan"
              element={<ScanPage />}
            />

            {/* Business Cards */}
            <Route
              path="/business-cards"
              element={<BusinessCardsListPage />}
            />

            <Route
              path="/business-cards/:id"
              element={<BusinessCardDetailPage />}
            />

            <Route
              path="/business-cards/:id/edit"
              element={<BusinessCardEditPage />}
            />

            {/* Companies */}
            <Route
              element={
                <RequireRole
                  roles={[
                    SUPER_ADMIN,
                    MAIN_COMPANY_ADMIN,
                    COMPANY_ADMIN,
                  ]}
                />
              }
            >
              <Route
                path="/companies"
                element={<CompaniesListPage />}
              />

              <Route
                path="/companies/:id"
                element={<CompanyDetailPage />}
              />
            </Route>

            {/* Super Admin Only */}
            <Route
              element={
                <RequireRole
                  roles={[SUPER_ADMIN]}
                />
              }
            >
              <Route
                path="/companies/new"
                element={<CompanyCreatePage />}
              />

              <Route
                path="/users"
                element={<UsersListPage />}
              />

              <Route
                path="/users/:id"
                element={<UserDetailPage />}
              />

              <Route
                path="/super-admins"
                element={<SuperAdminsListPage />}
              />

              <Route
                path="/audit-logs"
                element={<AuditLogsPage />}
              />
            </Route>

            {/* Profile */}
            <Route
              path="/profile"
              element={<ProfilePage />}
            />

          </Route>
        </Route>

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </Suspense>
  );
}

export default App;
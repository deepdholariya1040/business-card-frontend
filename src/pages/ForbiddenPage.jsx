import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import Button from "../components/ui/Button.jsx";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <ShieldAlert className="h-10 w-10 text-red-400" />
      <h1 className="font-display text-3xl font-bold text-ink-900">Access denied</h1>
      <p className="max-w-sm text-sm text-ink-500">
        Your role doesn't have permission to view this page.
      </p>
      <Link to="/dashboard">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}

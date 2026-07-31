import { Link } from "react-router-dom";
import { CompassIcon } from "lucide-react";
import Button from "../components/ui/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <CompassIcon className="h-10 w-10 text-ink-300" />
      <h1 className="font-display text-3xl font-bold text-ink-900">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/dashboard">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}

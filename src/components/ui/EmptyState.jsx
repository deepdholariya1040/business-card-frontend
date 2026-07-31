import { Inbox, AlertCircle } from "lucide-react";

export const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50">
      <Icon className="h-6 w-6 text-ink-300" />
    </div>
    <div>
      <p className="font-medium text-ink-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-400">{description}</p>}
    </div>
    {action}
  </div>
);

export const ErrorState = ({ title = "Couldn't load this.", description }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
      <AlertCircle className="h-6 w-6 text-red-400" />
    </div>
    <div>
      <p className="font-medium text-ink-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-400">{description}</p>}
    </div>
  </div>
);

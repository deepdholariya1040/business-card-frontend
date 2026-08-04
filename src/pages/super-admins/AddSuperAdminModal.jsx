import { useState } from "react";
import { X } from "lucide-react";

import Button from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function AddSuperAdminModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return alert("Name is required.");
    }

    if (!form.email.trim()) {
      return alert("Email is required.");
    }

    try {
      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      });

      setForm({
        name: "",
        email: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-ink-900">
            Add Super Admin
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 transition hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <Input
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <Input
                type="email"
                name="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
              The user will be created as a <b>Super Admin</b>. A welcome email
              will be sent to this email address. The user can then log in using
              Google Sign-In with the same email.
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Super Admin"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

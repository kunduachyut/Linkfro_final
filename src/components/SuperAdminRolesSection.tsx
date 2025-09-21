"use client";

import React, { useEffect, useState } from "react";

type Role = {
  _id?: string;
  email: string;
  role: "websites" | "requests" | "super";
};

type Props = {
  onRolesChange?: () => void;
};

export default function SuperAdminRolesSection({ onRolesChange }: Props) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [websitesEmail, setWebsitesEmail] = useState("");
  const [requestsEmail, setRequestsEmail] = useState("");
  const [superEmail, setSuperEmail] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-roles");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");
      setRoles(json.roles || []);
      const w = (json.roles || []).find((r: any) => r.role === "websites");
      const q = (json.roles || []).find((r: any) => r.role === "requests");
      setWebsitesEmail(w?.email || "");
      setRequestsEmail(q?.email || "");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveRole(role: "websites" | "requests" | "super", email: string) {
    if (!email || !email.includes("@")) {
      alert("Enter a valid email");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save");
      await load();
  // notify parent that roles have changed so it can refresh allowed tabs
  try { onRolesChange?.(); } catch (e) { /* ignore */ }
      if (role === "websites") setWebsitesEmail(email);
      if (role === "requests") setRequestsEmail(email);
      if (role === "super") setSuperEmail("");
      alert("Role saved");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  }

  async function clearRole(role: "websites" | "requests") {
    if (!confirm(`Remove ${role} admin?`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin-roles?role=${role}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete");
      await load();
  try { onRolesChange?.(); } catch (e) { /* ignore */ }
      if (role === "websites") setWebsitesEmail("");
      if (role === "requests") setRequestsEmail("");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to delete role");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRoleById(id?: string) {
    if (!id) return;
    if (!confirm("Remove this role assignment?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin-roles?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete");
      await load();
      try { onRolesChange?.(); } catch (e) { /* ignore */ }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to delete role");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-3">Sub‑Admin Role Management</h3>
      <p className="text-sm text-gray-600 mb-4">Assign emails to roles. Super admin can manage assignments here.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website Analyst</label>
          <div className="flex gap-2">
            <input value={websitesEmail} onChange={(e) => setWebsitesEmail(e.target.value)} className="flex-1 px-3 py-2 border rounded" placeholder="email@example.com" />
            <button onClick={() => saveRole("websites", websitesEmail)} disabled={saving} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
            <button onClick={() => clearRole("websites")} disabled={saving} className="px-3 py-2 border rounded">Clear</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content Manager</label>
          <div className="flex gap-2">
            <input value={requestsEmail} onChange={(e) => setRequestsEmail(e.target.value)} className="flex-1 px-3 py-2 border rounded" placeholder="email@example.com" />
            <button onClick={() => saveRole("requests", requestsEmail)} disabled={saving} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
            <button onClick={() => clearRole("requests")} disabled={saving} className="px-3 py-2 border rounded">Clear</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Super Admins (full access)</label>
          <div className="flex gap-2">
            <input value={superEmail} onChange={(e) => setSuperEmail(e.target.value)} className="flex-1 px-3 py-2 border rounded" placeholder="email@example.com" />
            <button onClick={() => saveRole("super", superEmail)} disabled={saving} className="px-3 py-2 bg-green-600 text-white rounded">Add</button>
          </div>
        </div>
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

      <div className="mt-6 text-sm text-gray-600">
        Current assignments:
        <ul className="mt-2 space-y-2">
          {roles.length === 0 && <li className="text-xs text-gray-500">No assignments</li>}
          {roles.map(r => (
            <li key={r._id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="truncate">
                <strong className="capitalize">{r.role}</strong>: <span className="ml-1">{r.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteRoleById(r._id)}
                  className="px-2 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                  disabled={saving}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
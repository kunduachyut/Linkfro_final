"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type Role = {
  _id?: string;
  email: string;
  role: "websites" | "requests" | "super";
  active?: boolean;
};

type Props = {
  onRolesChange?: () => void;
};

export default function SuperAdminRolesSection({ onRolesChange }: Props) {
  const { toast } = useToast();
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
    const normalized = (email || '').toLowerCase().trim();
    if (!normalized || !normalized.includes("@")) {
      alert("Enter a valid email");
      return;
    }

    // Prevent assigning same email to multiple different roles
    const conflict = roles.find(r => r.email?.toLowerCase().trim() === normalized && r.role !== role);
    if (conflict) {
      alert(`This email is already assigned to the '${conflict.role}' role. Use a different email.`);
      return;
    }

    // If same role + email already exists, avoid duplicate (for super role it's allowed to have multiple but not duplicates)
    const duplicate = roles.find(r => r.email?.toLowerCase().trim() === normalized && r.role === role);
    if (duplicate) {
      alert(`This email is already assigned as '${role}'.`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email: normalized }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save");
      await load();
      // notify parent that roles have changed so it can refresh allowed tabs
      try { onRolesChange?.(); } catch (e) { /* ignore */ }
      // record audit
      try {
        await fetch('/api/admin-role-audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetEmail: normalized, role, action: 'create', notes: 'Created via roles UI' }) });
      } catch (e) { /* ignore audit failures */ }
      toast({ title: 'Role saved', description: `Assigned ${normalized} as ${role}` });
      if (role === "websites") setWebsitesEmail(normalized);
      if (role === "requests") setRequestsEmail(normalized);
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
      try {
        await fetch('/api/admin-role-audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetEmail: role === 'websites' ? websitesEmail : requestsEmail, role, action: 'delete', notes: 'Cleared via roles UI' }) });
      } catch (e) { /* ignore */ }
      toast({ title: 'Role removed', description: `Removed ${role} admin` });
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
      try {
        await fetch('/api/admin-role-audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetEmail: roles.find(r => r._id === id)?.email || '', action: 'delete', role: roles.find(r => r._id === id)?.role }) });
      } catch (e) { /* ignore */ }
      toast({ title: 'Role removed', description: `Role entry removed` });
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to delete role");
    } finally {
      setSaving(false);
    }
  }

  // Clear a super admin by the email entered in the superEmail input
  async function clearSuperByEmail() {
    const normalized = (superEmail || '').toLowerCase().trim();
    if (!normalized) {
      alert('Enter super admin email to remove');
      return;
    }
    const found = roles.find(r => r.role === 'super' && r.email?.toLowerCase().trim() === normalized);
    if (!found || !found._id) {
      alert('No super admin with that email found');
      return;
    }
    if (!confirm(`Remove super admin ${normalized}?`)) return;
    setSaving(true);
    try {
      await deleteRoleById(found._id);
      // deleteRoleById already reloads and triggers parent; ensure input cleared
      setSuperEmail('');
      toast({ title: 'Super removed', description: `Removed super admin ${normalized}` });
    } catch (err) {
      // deleteRoleById handles errors and alerts
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
            <button onClick={clearSuperByEmail} disabled={saving} className="px-3 py-2 border rounded">Remove</button>
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
                <div className="text-xs text-gray-500">{r.active === false ? 'Paused' : 'Active'}</div>
              </div>
              <div className="flex items-center gap-2">
                {/* Toggle active/paused */}
                <button
                  onClick={async () => {
                    if (!r._id) return;
                    const newActive = r.active === false ? true : false;
                    setSaving(true);
                    try {
                      const res = await fetch('/api/admin-roles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: r._id, active: newActive }) });
                      const json = await res.json();
                      if (!json.success) throw new Error(json.error || 'Failed to update');
                      await load();
                      try { onRolesChange?.(); } catch (e) { /* ignore */ }
                      // record audit
                      try {
                        await fetch('/api/admin-role-audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetEmail: r.email, role: r.role, action: newActive ? 'continue' : 'pause', notes: 'Toggled via roles UI' }) });
                      } catch (e) { /* ignore */ }
                      // show toast notification
                      toast({ title: `Role ${newActive ? 'continued' : 'paused'}`, description: `${r.email} is now ${newActive ? 'active' : 'paused'}` });
                    } catch (err: any) {
                      console.error(err);
                      alert(err?.message || 'Failed to update role');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className={`px-2 py-1 text-sm ${r.active === false ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-green-100 text-green-800 border border-green-200'} rounded`}
                  disabled={saving}
                >
                  {r.active === false ? 'Continue' : 'Pause'}
                </button>

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
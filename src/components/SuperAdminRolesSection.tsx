"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId } from "react";

type Role = {
  _id?: string;
  email: string;
  role: "websites" | "requests" | "super";
  active?: boolean;
};

type UserRole = 'websites' | 'requests' | 'super';

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
  const [selectedRoles, setSelectedRoles] = useState<Record<string, boolean>>({});
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('websites');
  const emailInputId = useId();

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

  const toggleRoleSelection = (roleId: string) => {
    setSelectedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const toggleSelectAll = () => {
    const newSelectAll = !isAllSelected;
    setIsAllSelected(newSelectAll);
    
    const newSelected: Record<string, boolean> = {};
    roles.forEach(role => {
      newSelected[role._id || ''] = newSelectAll;
    });
    
    setSelectedRoles(newSelected);
  };

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

  const assignRoles = async () => {
    const selectedRoleIds = Object.entries(selectedRoles)
        .filter(([_, isSelected]) => isSelected)
        .map(([roleId, _]) => roleId);
        
    if (selectedRoleIds.length === 0) {
        alert('Please select at least one role assignment');
        return;
    }
    
    // In a real implementation, this would be an API call to change roles
    try {
        // For now, we'll just show an alert since the actual API would need to be implemented
        alert(`In a real implementation, this would assign the ${newRole} role to the selected users. Selected ${selectedRoleIds.length} role assignment(s).`);
        
        // Clear selections
        const clearedSelections: Record<string, boolean> = {};
        selectedRoleIds.forEach(id => {
            clearedSelections[id] = false;
        });
        setSelectedRoles(clearedSelections);
        setIsAllSelected(false);
    } catch (error) {
        console.error('Failed to assign roles:', error);
        alert('Failed to assign roles. Please try again.');
    }
  };

  const removeSelectedRoles = async () => {
    const selectedRoleIds = Object.entries(selectedRoles)
        .filter(([_, isSelected]) => isSelected)
        .map(([roleId, _]) => roleId);
        
    if (selectedRoleIds.length === 0) {
        alert('Please select at least one role assignment');
        return;
    }
    
    if (!window.confirm(`Are you sure you want to remove ${selectedRoleIds.length} role assignment(s)?`)) {
        return;
    }
    
    // Process deletions
    try {
        for (const roleId of selectedRoleIds) {
            await deleteRoleById(roleId);
        }
        
        // Clear selections
        const clearedSelections: Record<string, boolean> = {};
        selectedRoleIds.forEach(id => {
            clearedSelections[id] = false;
        });
        setSelectedRoles(clearedSelections);
        setIsAllSelected(false);
        
        alert(`Successfully removed ${selectedRoleIds.length} role assignment(s)`);
    } catch (error) {
        console.error('Failed to remove roles:', error);
        alert('Failed to remove some roles. Please try again.');
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
        case 'websites': return 'Website Analyst';
        case 'requests': return 'Content Manager';
        case 'super': return 'Super Admin';
        default: return role;
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
        case 'websites': return 'bg-blue-100 text-blue-800';
        case 'requests': return 'bg-green-100 text-green-800';
        case 'super': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-GB", { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-800">User Roles Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage user permissions by assigning roles</p>
        </div>
      </div>

      {/* Add user by email */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-md font-medium text-gray-800 mb-3">Assign Role to User</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Label htmlFor={emailInputId} className="sr-only">User Email</Label>
            <Input
              id={emailInputId}
              type="email"
              placeholder="Enter user email"
              value={superEmail}
              onChange={(e) => setSuperEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="websites">Website Analyst</option>
              <option value="requests">Content Manager</option>
              <option value="super">Super Admin</option>
            </select>
            <button
              onClick={() => saveRole(newRole, superEmail)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Add User'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {(Object.values(selectedRoles).some(isSelected => isSelected)) && (
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="websites">Website Analyst</option>
              <option value="requests">Content Manager</option>
              <option value="super">Super Admin</option>
            </select>
            <button
              onClick={assignRoles}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
              disabled={saving}
            >
              Change Role
            </button>
          </div>
          <button
            onClick={removeSelectedRoles}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            disabled={saving}
          >
            Remove Role
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap w-10">
                  <input
                    type="checkbox"
                    checked={!!selectedRoles[role._id || '']}
                    onChange={() => toggleRoleSelection(role._id || '')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{role.email}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(role.role)}`}>
                    {getRoleDisplayName(role.role)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                    role.active === false 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {role.active === false ? 'Paused' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {/* Toggle active/paused */}
                    <button
                      onClick={async () => {
                        if (!role._id) return;
                        const newActive = role.active === false ? true : false;
                        setSaving(true);
                        try {
                          const res = await fetch('/api/admin-roles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: role._id, active: newActive }) });
                          const json = await res.json();
                          if (!json.success) throw new Error(json.error || 'Failed to update');
                          await load();
                          try { onRolesChange?.(); } catch (e) { /* ignore */ }
                          // record audit
                          try {
                            await fetch('/api/admin-role-audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetEmail: role.email, role: role.role, action: newActive ? 'continue' : 'pause', notes: 'Toggled via roles UI' }) });
                          } catch (e) { /* ignore */ }
                          // show toast notification
                          toast({ title: `Role ${newActive ? 'continued' : 'paused'}`, description: `${role.email} is now ${newActive ? 'active' : 'paused'}` });
                        } catch (err: any) {
                          console.error(err);
                          alert(err?.message || 'Failed to update role');
                        } finally {
                          setSaving(false);
                        }
                      }}
                      className={`px-2 py-1 text-sm ${role.active === false ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-green-100 text-green-800 border border-green-200'} rounded`}
                      disabled={saving}
                    >
                      {role.active === false ? 'Continue' : 'Pause'}
                    </button>

                    <button
                      onClick={() => deleteRoleById(role._id)}
                      className="px-2 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                      disabled={saving}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {roles.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Role Assignments Found</h3>
          <p className="text-gray-500">There are no role assignments to display.</p>
        </div>
      )}
      
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading role assignments...</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="ml-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
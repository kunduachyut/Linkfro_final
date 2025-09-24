"use client";

import React from "react";

type Tab =
  | "websites"
  | "userContent"
  | "purchases"
  | "contentRequests"
  | "priceConflicts"
  | "userRequests"
  | "roles";

type SidebarProps = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  // new prop: list of tabs the current user is allowed to see
  allowedTabs: Tab[];
  // new prop: flags indicating whether a tab has new items since last view
  newItems?: Record<Tab, boolean>;
};

export default function SuperAdminSidebar(props: SidebarProps) {
  const { activeTab, setActiveTab, allowedTabs } = props;
  const newItems = props.newItems || {
    websites: false,
    userContent: false,
    purchases: false,
    contentRequests: false,
    priceConflicts: false,
    userRequests: false,
    roles: false,
  };

  const show = (tab: Tab) => allowedTabs.includes(tab);

  return (
    <aside className="w-64 min-h-screen border-r border-gray-200 bg-white flex flex-col sticky top-0 h-screen overflow-y-auto" style={{ backgroundColor: 'var(--base-primary)' }}>
      <div className="p-6 border-b border-gray-200" style={{ borderColor: 'var(--base-tertiary)' }}>
        <h2 className="text-xl font-bold" style={{ color: 'var(--secondary-primary)' }}>Admin Dashboard</h2>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {show("websites") && (
            <li>
              <button
                onClick={() => setActiveTab("websites")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center gap-3 ${
                  activeTab === "websites"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor: activeTab === "websites" ? 'var(--accent-light)' : '',
                  color: activeTab === "websites" ? 'var(--accent-primary)' : ''
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9-3-9" />
                </svg>
                <div className="flex items-center gap-2">
                  <span>Websites</span>
                  {newItems.websites && (
                    <span className="inline-block w-2.5 h-2.5 bg-red-600 rounded-full" aria-hidden="true"></span>
                  )}
                </div>
              </button>
            </li>
          )}

          {show("purchases") && (
            <li>
              <button
                onClick={() => setActiveTab("purchases")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center gap-3 ${
                  activeTab === "purchases"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor: activeTab === "purchases" ? 'var(--accent-light)' : '',
                  color: activeTab === "purchases" ? 'var(--accent-primary)' : ''
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="flex items-center gap-2">
                  <span>Purchases</span>
                  {newItems.purchases && (
                    <span className="inline-block w-2.5 h-2.5 bg-red-600 rounded-full" aria-hidden="true"></span>
                  )}
                </div>
              </button>
            </li>
          )}

          {show("contentRequests") && (
            <li>
              <button
                onClick={() => setActiveTab("contentRequests")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center gap-3 ${
                  activeTab === "contentRequests"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor: activeTab === "contentRequests" ? 'var(--accent-light)' : '',
                  color: activeTab === "contentRequests" ? 'var(--accent-primary)' : ''
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex items-center gap-2">
                  <span>Content Requests</span>
                  {newItems.contentRequests && (
                    <span className="inline-block w-2.5 h-2.5 bg-red-600 rounded-full" aria-hidden="true"></span>
                  )}
                </div>
              </button>
            </li>
          )}

          {show("userContent") && (
            <li>
              <button
                onClick={() => setActiveTab("userContent")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center gap-3 ${
                  activeTab === "userContent"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor: activeTab === "userContent" ? 'var(--accent-light)' : '',
                  color: activeTab === "userContent" ? 'var(--accent-primary)' : ''
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div className="flex items-center gap-2">
                  <span>User Uploads</span>
                  {newItems.userContent && (
                    <span className="inline-block w-2.5 h-2.5 bg-red-600 rounded-full" aria-hidden="true"></span>
                  )}
                </div>
              </button>
            </li>
          )}

          {show("priceConflicts") && (
            <li>
              <button
                onClick={() => setActiveTab("priceConflicts")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center gap-3 ${
                  activeTab === "priceConflicts"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor: activeTab === "priceConflicts" ? 'var(--accent-light)' : '',
                  color: activeTab === "priceConflicts" ? 'var(--accent-primary)' : ''
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex items-center gap-2">
                  <span>Price Conflicts</span>
                  {newItems.priceConflicts && (
                    <span className="inline-block w-2.5 h-2.5 bg-red-600 rounded-full" aria-hidden="true"></span>
                  )}
                </div>
              </button>
            </li>
          )}

          {show("userRequests") && (
            <li>
              <button
                onClick={() => setActiveTab("userRequests")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center gap-3 ${
                  activeTab === "userRequests"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor: activeTab === "userRequests" ? 'var(--accent-light)' : '',
                  color: activeTab === "userRequests" ? 'var(--accent-primary)' : ''
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div className="flex items-center gap-2">
                  <span>User Requests</span>
                  {newItems.userRequests && (
                    <span className="inline-block w-2.5 h-2.5 bg-red-600 rounded-full" aria-hidden="true"></span>
                  )}
                </div>
              </button>
            </li>
          )}

          {show("roles") && (
            <li>
              <button
                onClick={() => setActiveTab("roles")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center gap-3 ${
                  activeTab === "roles"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor: activeTab === "roles" ? 'var(--accent-light)' : '',
                  color: activeTab === "roles" ? 'var(--accent-primary)' : ''
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div className="flex items-center gap-2">
                  <span>Roles</span>
                  {newItems.roles && (
                    <span className="inline-block w-2.5 h-2.5 bg-red-600 rounded-full" aria-hidden="true"></span>
                  )}
                </div>
              </button>
            </li>
          )}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200" style={{ borderColor: 'var(--base-tertiary)' }}>
        <button className="w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition duration-200 flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
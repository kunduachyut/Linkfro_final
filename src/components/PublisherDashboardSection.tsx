import { useState } from "react";
import React from "react";

type Website = {
  _id: string;
  title: string;
  url: string;
  description: string;
  priceCents: number;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  clicks?: number;
  DA?: number;
  PA?: number;
  Spam?: number;
  OrganicTraffic?: number;
  DR?: number;
  RD?: string;
  category?: string;
  tags?: string;
  primaryCountry?: string; // Add primaryCountry field
};

export default function PublisherDashboardSection({ 
  stats,
  mySites,
  setActiveTab,
  getStatusBadge,
  formatPrice
}: {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  mySites: Website[];
  setActiveTab: (tab: "dashboard" | "websites" | "add-website" | "analytics" | "earnings" | "settings") => void;
  getStatusBadge: (status: string, rejectionReason?: string) => React.ReactElement;
  formatPrice: (cents?: number) => string;
}) {
  const computePublisherVisiblePrice = (s: any) => {
    if (s && typeof s.originalPriceCents === 'number' && s.originalPriceCents != null) return s.originalPriceCents;
    const extra = (s && typeof s.adminExtraPriceCents === 'number') ? s.adminExtraPriceCents : 0;
    if (extra > 0 && s && typeof s.priceCents === 'number') {
      const derived = s.priceCents - extra;
      return derived >= 0 ? derived : s.priceCents;
    }
    return s && typeof s.priceCents === 'number' ? s.priceCents : 0;
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg shadow-sm p-6" style={{backgroundColor: 'var(--base-primary)', border: '1px solid var(--base-tertiary)'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--accent-light)'}}>
                <span className="material-symbols-outlined" style={{color: 'var(--accent-primary)'}}>web</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: 'var(--secondary-lighter)'}}>Total Websites</p>
              <p className="text-2xl font-bold" style={{color: 'var(--secondary-primary)'}}>{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg shadow-sm p-6" style={{backgroundColor: 'var(--base-primary)', border: '1px solid var(--base-tertiary)'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--success)'}}>
                <span className="material-symbols-outlined text-white">check_circle</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: 'var(--secondary-lighter)'}}>Approved</p>
              <p className="text-2xl font-bold" style={{color: 'var(--secondary-primary)'}}>{stats.approved}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg shadow-sm p-6" style={{backgroundColor: 'var(--base-primary)', border: '1px solid var(--base-tertiary)'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--warning)'}}>
                <span className="material-symbols-outlined text-white">pending</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: 'var(--secondary-lighter)'}}>Pending</p>
              <p className="text-2xl font-bold" style={{color: 'var(--secondary-primary)'}}>{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg shadow-sm p-6" style={{backgroundColor: 'var(--base-primary)', border: '1px solid var(--base-tertiary)'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--error)'}}>
                <span className="material-symbols-outlined text-white">cancel</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: 'var(--secondary-lighter)'}}>Rejected</p>
              <p className="text-2xl font-bold" style={{color: 'var(--secondary-primary)'}}>{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg shadow-sm p-6" style={{backgroundColor: 'var(--base-primary)', border: '1px solid var(--base-tertiary)'}}>
        <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--secondary-primary)'}}>Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab("add-website")}
            className="flex items-center p-4 border-2 border-dashed rounded-lg transition-colors text-left"
            style={{
              borderColor: 'var(--base-tertiary)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderColor = 'var(--accent-primary)';
              (e.target as HTMLElement).style.backgroundColor = 'var(--accent-light)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderColor = 'var(--base-tertiary)';
              (e.target as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            <span className="material-symbols-outlined mr-3" style={{color: 'var(--accent-primary)'}}>add</span>
            <div>
              <p className="font-medium" style={{color: 'var(--secondary-primary)'}}>Add Website</p>
              <p className="text-sm" style={{color: 'var(--secondary-lighter)'}}>Submit a new website for approval</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab("websites")}
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
          >
            <span className="material-symbols-outlined text-green-600 mr-3">web</span>
            <div>
              <p className="font-medium text-gray-900">Manage Websites</p>
              <p className="text-sm text-gray-500">View and edit your websites</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab("analytics")}
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
          >
            <span className="material-symbols-outlined text-purple-600 mr-3">analytics</span>
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-500">Track performance metrics</p>
            </div>
          </button>
        </div>
      </div>

      {mySites.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Websites</h3>
          <div className="space-y-4">
            {mySites.slice(0, 3).map((site) => (
              <div key={site._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{site.title}</h4>
                  <p className="text-sm text-gray-500">{site.url}</p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(site.status, site.rejectionReason)}
                  <span className="text-sm font-medium text-green-600">
                    {formatPrice(computePublisherVisiblePrice(site as any))}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {mySites.length > 3 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setActiveTab("websites")}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View all websites →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
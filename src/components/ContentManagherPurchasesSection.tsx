"use client";

import React, { useState, useEffect } from 'react';
// Chat feature removed for Content Manager view

// Type definitions
type PurchaseRequest = {
  id: string;
  websiteId: string;
  websiteTitle: string;
  priceCents: number;
  totalCents: number;
  customerId: string;
  customerEmail: string;
  status: "pending" | "ongoing" | "pendingPayment" | "approved" | "rejected";
  createdAt: string;
  updatedAt?: string;
  contentType?: "content" | "request" | null;
  docLink?: string;
  liveLink?: string;
  paymentLink?: string;
};

// ...in SuperAdminPurchasesSection.tsx
type FilterType = "all" | "pending" | "ongoing" | "pendingPayment" | "approved" | "rejected";
type SuperAdminPurchasesSectionProps = {
  purchaseRequests: PurchaseRequest[];
  filteredPurchaseRequests: PurchaseRequest[];
  purchaseFilter: FilterType;
  setPurchaseFilter: (filter: FilterType) => void;
  purchaseStats: {
    pending: number;
    ongoing: number;         
    pendingPayment: number;  
    approved: number;
    rejected: number;
    total: number;
  };
  selectedPurchases: string[];
  isAllPurchasesSelected: boolean;
  toggleSelectAllPurchases: () => void;
  togglePurchaseSelection: (id: string) => void;
  approveSelectedPurchases: () => void;
  updatePurchaseStatus: (purchaseId: string, status: "approved" | "rejected") => void;
  fetchContentDetails: (purchase: PurchaseRequest) => void;
  formatCurrency: (cents: number) => string;
  formatDate: (dateString?: string) => string;
  // Add new props for confirmation modal
  showConfirmationModal: boolean;
  setShowConfirmationModal: (show: boolean) => void;
  confirmationAction: { purchaseId: string | null; status: "approved" | "rejected" | "ongoing" | "pendingPayment" | null };
  setConfirmationAction: (action: { purchaseId: string | null; status: "approved" | "rejected" | "ongoing" | "pendingPayment" | null }) => void;
  confirmPurchaseStatusUpdate: () => void;
  messages?: { [key: string]: string };
  setMessages?: (updater: (prev: { [key: string]: string }) => { [key: string]: string }) => void;
  currentUserId: string; // Add this for chat functionality
  userRole: 'superadmin';
};

const SuperAdminPurchasesSection: React.FC<SuperAdminPurchasesSectionProps> = ({
  purchaseRequests,
  filteredPurchaseRequests,
  purchaseFilter,
  setPurchaseFilter,
  purchaseStats,
  selectedPurchases,
  isAllPurchasesSelected,
  toggleSelectAllPurchases,
  togglePurchaseSelection,
  approveSelectedPurchases,
  updatePurchaseStatus,
  fetchContentDetails,
  formatCurrency,
  formatDate,
  // New props for confirmation modal
  showConfirmationModal,
  setShowConfirmationModal,
  confirmationAction,
  setConfirmationAction,
  confirmPurchaseStatusUpdate,
  messages,
  setMessages,
  currentUserId,
  userRole
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  // Modal state for editing doc/live links (match SuperAdmin behavior)
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkModalType, setLinkModalType] = useState<'doc' | 'live' | null>(null);
  const [linkModalPurchaseId, setLinkModalPurchaseId] = useState<string | null>(null);
  const [linkModalValue, setLinkModalValue] = useState<string>('');
  // Modal state for payment link (PDF + URL)
  const [paymentLinkModalOpen, setPaymentLinkModalOpen] = useState(false);
  const [paymentLinkPurchaseId, setPaymentLinkPurchaseId] = useState<string | null>(null);
  const [paymentLinkUrl, setPaymentLinkUrl] = useState<string>('');
  const [paymentLinkPdf, setPaymentLinkPdf] = useState<File | null>(null);

  const statusLabelMap: Record<string, string> = {
    ongoing: "Mark as Ongoing",
    pendingPayment: "Move to Pending Payment",
    approved: "Approve",
    rejected: "Reject",
  };

  // Check if any visible rows have pendingPayment status
  const showPaymentLinkColumn = filteredPurchaseRequests.some(p => p.status === 'pendingPayment');

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get status badge component
  const getStatusBadge = (status: PurchaseRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            Pending
          </span>
        );
      case "ongoing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Ongoing
          </span>
        );
      case "pendingPayment":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending Payment
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  // Get content type badge
  const getContentTypeBadge = (contentType: PurchaseRequest["contentType"], purchase: PurchaseRequest) => {
    if (contentType === 'content') {
      return (
        <button
          onClick={() => fetchContentDetails(purchase)}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
          title="Click to view uploaded content details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          My Content
        </button>
      );
    } else if (contentType === 'request') {
      return (
        <button
          onClick={() => fetchContentDetails(purchase)}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
          title="Click to view content request details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Request Content
        </button>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          Not Selected
        </span>
      );
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Purchase Requests</h2>
        </div>
      
        {/* Bulk Actions Toolbar - Only show for pending purchases */}
        {purchaseFilter === "pending" && filteredPurchaseRequests.length > 0 && (
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isAllPurchasesSelected}
                onChange={toggleSelectAllPurchases}
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                {(selectedPurchases || []).length > 0 
                  ? `${(selectedPurchases || []).length} purchase(s) selected` 
                  : "Select all"}
              </span>
            </div>
            
            {(selectedPurchases || []).length > 0 && (
              <button
                onClick={approveSelectedPurchases}
                disabled={(selectedPurchases || []).length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve Selected ({(selectedPurchases || []).length})
              </button>
            )}
          </div>
        )}
      
        {/* Purchase Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Total</h3>
            <p className="text-lg font-bold text-gray-900">{purchaseStats.total}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <h3 className="text-xs font-medium text-amber-700 mb-1">Pending</h3>
            <p className="text-lg font-bold text-amber-900">{purchaseStats.pending}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h3 className="text-xs font-medium text-blue-700 mb-1">Ongoing</h3>
            <p className="text-lg font-bold text-blue-900">{purchaseStats.ongoing}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <h3 className="text-xs font-medium text-yellow-700 mb-1">Pending Payment</h3>
            <p className="text-lg font-bold text-yellow-900">{purchaseStats.pendingPayment}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <h3 className="text-xs font-medium text-green-700 mb-1">Approved</h3>
            <p className="text-lg font-bold text-green-900">{purchaseStats.approved}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <h3 className="text-xs font-medium text-red-700 mb-1">Rejected</h3>
            <p className="text-lg font-bold text-red-900">{purchaseStats.rejected}</p>
          </div>
        </div>

        {/* Purchase Filter Tabs (Content Manager: only show pending / ongoing / pendingPayment) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["pending", "ongoing", "pendingPayment"] as FilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setPurchaseFilter(tab)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                purchaseFilter === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                {tab === "pending" && purchaseStats.pending > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    purchaseFilter === tab 
                      ? "bg-white text-indigo-600" 
                      : "bg-indigo-100 text-indigo-600"
                  }`}>
                    {purchaseStats.pending}
                  </span>
                )}
                {tab === "ongoing" && purchaseStats.ongoing > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-600">
                    {purchaseStats.ongoing}
                  </span>
                )}
                {tab === "pendingPayment" && purchaseStats.pendingPayment > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold bg-yellow-100 text-yellow-600">
                    {purchaseStats.pendingPayment}
                  </span>
                )}
                {tab === "approved" && purchaseStats.approved > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    purchaseFilter === tab 
                      ? "bg-white text-indigo-600" 
                      : "bg-indigo-100 text-indigo-600"
                  }`}>
                    {purchaseStats.approved}
                  </span>
                )}
                {tab === "rejected" && purchaseStats.rejected > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold bg-red-100 text-red-600">
                    {purchaseStats.rejected}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Purchase Requests List */}
        {filteredPurchaseRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Purchase Requests Found</h3>
            <p className="text-gray-500">No purchase requests found with status: <span className="font-medium">{purchaseFilter}</span>.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {purchaseFilter === "pending" && (
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <input 
                          type="checkbox" 
                          checked={isAllPurchasesSelected}
                          onChange={toggleSelectAllPurchases}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                      </th>
                    )}
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Website
                      
                    </th>
                    {/* Customer (removed) */}
                    {/* Price (removed) */}
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {/* Chat column removed per request */}
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Live link
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doc link
                    </th>
                    {showPaymentLinkColumn && (
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Link
                      </th>
                    )}
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPurchaseRequests.map((request) => (
                    <React.Fragment key={request.id}>
                      <tr className="hover:bg-gray-50">
                        {purchaseFilter === "pending" && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input 
                              type="checkbox" 
                              checked={(selectedPurchases || []).includes(request.id)}
                              onChange={() => togglePurchaseSelection(request.id)}
                              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                            />
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{request.websiteTitle || 'Untitled'}</div>
                        </td>
                        {/* Customer and Price columns removed for Content Manager view */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getContentTypeBadge(request.contentType, request)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(request.status || 'pending')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                        {/* Chat cell removed */}
                        {/* Live link column (separate cell) */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col items-start gap-1">
                            <div>
                              {request.liveLink ? (
                                <button
                                  onClick={() => window.open(request.liveLink, '_blank')}
                                  title="Visit live link"
                                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                >
                                  Live
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setLinkModalType('live');
                                    setLinkModalPurchaseId(request.id);
                                    setLinkModalValue(messages?.[`liveLink:${request.id}`] || request.liveLink || '');
                                    setLinkModalOpen(true);
                                  }}
                                  title="Add live link"
                                  className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                                >
                                  Add Live
                                </button>
                              )}
                            </div>
                            {request.liveLink && userRole === 'superadmin' && (
                              <button
                                onClick={() => {
                                  setLinkModalType('live');
                                  setLinkModalPurchaseId(request.id);
                                  setLinkModalValue(messages?.[`liveLink:${request.id}`] || request.liveLink || '');
                                  setLinkModalOpen(true);
                                }}
                                title="Edit live link"
                                className="text-indigo-600 hover:text-indigo-800 text-xs font-medium mt-1"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </td>
                        {/* Doc link column (separate cell) */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col items-start gap-1">
                            <div>
                              {request.docLink ? (
                                <button
                                  onClick={() => window.open(request.docLink, '_blank')}
                                  title="Visit document"
                                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                >
                                  Doc
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setLinkModalType('doc');
                                    setLinkModalPurchaseId(request.id);
                                    setLinkModalValue(messages?.[`docLink:${request.id}`] || request.docLink || '');
                                    setLinkModalOpen(true);
                                  }}
                                  title="Add document"
                                  className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                                >
                                  Add Doc
                                </button>
                              )}
                            </div>
                            {request.docLink && userRole === 'superadmin' && (
                              <button
                                onClick={() => {
                                  setLinkModalType('doc');
                                  setLinkModalPurchaseId(request.id);
                                  setLinkModalValue(messages?.[`docLink:${request.id}`] || request.docLink || '');
                                  setLinkModalOpen(true);
                                }}
                                title="Edit document"
                                className="text-indigo-600 hover:text-indigo-800 text-xs font-medium mt-1"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </td>
                        {/* Payment Link column - only show when there are pendingPayment rows */}
                        {showPaymentLinkColumn && request.status === 'pendingPayment' && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setPaymentLinkPurchaseId(request.id);
                                setPaymentLinkUrl(request.paymentLink || '');
                                setPaymentLinkPdf(null);
                                setPaymentLinkModalOpen(true);
                              }}
                              title={request.paymentLink ? "Edit payment link" : "Add payment link or document"}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                request.paymentLink
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {request.paymentLink ? 'Edit Link' : 'Add Link'}
                            </button>
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {(request.status || 'pending') === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setConfirmationAction({ purchaseId: request.id, status: "approved" });
                                    setShowConfirmationModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                                  title="Approve Purchase"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    setConfirmationAction({ purchaseId: request.id, status: "rejected" });
                                    setShowConfirmationModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                                  title="Reject Purchase"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            )}
                            {request.status === 'pending' && (
                              <button
                                onClick={() => {
                                  setConfirmationAction({ purchaseId: request.id, status: "ongoing" });
                                  setShowConfirmationModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                                title="Mark as Ongoing"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </button>
                            )}
                            {request.status === 'ongoing' && (
                              <button
                                onClick={() => {
                                  setConfirmationAction({ purchaseId: request.id, status: "pendingPayment" });
                                  setShowConfirmationModal(true);
                                }}
                                className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors"
                                title="Mark as Pending Payment"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </button>
                            )}
                            {request.status === 'pendingPayment' && (
                              <button
                                onClick={() => {
                                  setConfirmationAction({ purchaseId: request.id, status: "approved" });
                                  setShowConfirmationModal(true);
                                }}
                                className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                                title="Mark as Approved (Payment Received)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            
                          </div>
                        </td>
                      </tr>

                      {expandedRows[request.id] && (
                        <tr>
                          {/* Adjust colspan since Customer and Price columns removed */}
                          {/* Adjust colspan after removing Chat and Customer/Price columns for Content Manager view */}
                          <td colSpan={(purchaseFilter === 'pending' ? 1 : 0) + 7 + (showPaymentLinkColumn ? 1 : 0)} className="px-4 py-2 bg-gray-50">
                            <div className="flex justify-end">
                              <div className="flex flex-col gap-2 w-full max-w-md">
                                <div className="flex flex-col">
                                  {/* Payment Link: only visible when the purchase is in pendingPayment state */}
                                  {request.status === 'pendingPayment' && (
                                    <>
                                      {/* Payment Link */}
                                      <label className="text-xs text-gray-500 mb-1">Payment Link</label>
                                      <div className="flex gap-2 mb-2">
                                        <textarea
                                          value={messages?.[`paymentLink:${request.id}`] || ''}
                                          onChange={(e) => setMessages && setMessages(prev => ({ ...prev, [`paymentLink:${request.id}`]: e.target.value }))}
                                          placeholder="Enter payment link or gateway URL"
                                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                                          rows={1}
                                        />
                                        <button
                                          onClick={async () => {
                                            const link = messages?.[`paymentLink:${request.id}`] || '';
                                            try {
                                              const res = await fetch(`/api/purchases/${request.id}/payment-link`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ paymentLink: link }),
                                              });

                                              const body = await res.json();
                                              if (!res.ok) {
                                                const serverMsg = body?.error || body?.message || `HTTP ${res.status}`;
                                                console.error('Push payment link failed', { status: res.status, body });
                                                alert(`Failed to push payment link: ${serverMsg}`);
                                                return;
                                              }
                                              
                                              // Update UI state
                                              request.paymentLink = body.paymentLink;
                                              // Clear input
                                              setMessages(prev => ({ ...prev, [`paymentLink:${request.id}`]: '' }));
                                              alert('Payment link pushed successfully');
                                            } catch (err) {
                                              console.error('Push payment link failed (network)', err);
                                              alert('Failed to push payment link (network error)');
                                            }
                                          }}
                                          className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 whitespace-nowrap"
                                        >
                                          Push Link
                                        </button>
                                      </div>

                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Chat removed from this view */}

      {/* Confirmation Modal */}
      {/* Link Edit Modal (Doc/Live) */}
      {linkModalOpen && linkModalType && linkModalPurchaseId && (
        <div className="fixed inset-0 bg-transparent bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{linkModalType === 'doc' ? 'Edit Document Link' : 'Edit Live Link'}</h3>
              <button onClick={() => setLinkModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">{linkModalType === 'doc' ? 'Document URL' : 'Live URL'}</label>
              <input
                type="url"
                value={linkModalValue}
                onChange={(e) => setLinkModalValue(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setLinkModalOpen(false); }} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
              <button
                onClick={async () => {
                  // validate
                  if (!linkModalValue || !linkModalValue.trim()) { alert('Please enter a valid URL'); return; }
                  try {
                    const id = linkModalPurchaseId;
                    if (linkModalType === 'doc') {
                      const res = await fetch(`/api/purchases/${id}/doc-link`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'same-origin',
                        body: JSON.stringify({ docLink: linkModalValue })
                      });
                      const body = await res.json().catch(() => ({}));
                      if (!res.ok) { const serverMsg = body?.error || body?.message || `HTTP ${res.status}`; alert(`Failed to save doc link: ${serverMsg}`); return; }
                      const idx = filteredPurchaseRequests.findIndex(p => p.id === id);
                      if (idx >= 0) filteredPurchaseRequests[idx].docLink = body.docLink;
                      setMessages && setMessages(prev => ({ ...prev, [`docLink:${id}`]: '' }));
                      setLinkModalOpen(false);
                      alert('Document link saved successfully');
                    } else if (linkModalType === 'live') {
                      const res = await fetch(`/api/purchases/${id}/live-link`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'same-origin',
                        body: JSON.stringify({ liveLink: linkModalValue })
                      });
                      const body = await res.json().catch(() => ({}));
                      if (!res.ok) { const serverMsg = body?.error || body?.message || `HTTP ${res.status}`; alert(`Failed to save live link: ${serverMsg}`); return; }
                      const idx = filteredPurchaseRequests.findIndex(p => p.id === id);
                      if (idx >= 0) filteredPurchaseRequests[idx].liveLink = body.liveLink;
                      setMessages && setMessages(prev => ({ ...prev, [`liveLink:${id}`]: '' }));
                      setLinkModalOpen(false);
                      alert('Live link saved successfully');
                    }
                  } catch (err) {
                    console.error('Failed saving link', err);
                    alert('Failed to save link (network or server error)');
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-2">
              {confirmationAction?.status ? statusLabelMap[confirmationAction.status] ?? `Confirm ${confirmationAction.status}` : "Confirm Action"}
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to {confirmationAction?.status ? (statusLabelMap[confirmationAction.status] ?? confirmationAction.status) : "perform this action"}?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // call the confirmation handler passed from parent (ensure it exists)
                  confirmPurchaseStatusUpdate && confirmPurchaseStatusUpdate();
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {confirmationAction?.status ? statusLabelMap[confirmationAction.status] ?? `Confirm ${confirmationAction.status}` : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Link Modal */}
      {paymentLinkModalOpen && paymentLinkPurchaseId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md border border-gray-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add Payment Link
              </h3>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment URL (optional)</label>
                <input
                  type="text"
                  value={paymentLinkUrl}
                  onChange={(e) => setPaymentLinkUrl(e.target.value)}
                  placeholder="e.g., https://payment.example.com/invoice/123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PDF Document (optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                  {paymentLinkPdf ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-900 font-medium">{paymentLinkPdf.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentLinkPdf(null)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm text-gray-600">Click to upload PDF</span>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type === 'application/pdf') {
                            setPaymentLinkPdf(file);
                          } else if (file) {
                            alert('Only PDF files are allowed');
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs text-blue-800">
                  <span className="font-medium">Note:</span> Provide either a payment URL or upload a PDF document (or both).
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setPaymentLinkModalOpen(false);
                  setPaymentLinkUrl('');
                  setPaymentLinkPdf(null);
                  setPaymentLinkPurchaseId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // Validation
                  if (!paymentLinkUrl.trim() && !paymentLinkPdf) {
                    alert('Please provide either a payment URL or upload a PDF document');
                    return;
                  }

                  if (paymentLinkUrl.trim()) {
                    try {
                      new URL(paymentLinkUrl);
                    } catch {
                      alert('Please provide a valid URL (e.g., https://example.com)');
                      return;
                    }
                  }

                  try {
                    const purchaseId = paymentLinkPurchaseId;
                    let finalPaymentLink = paymentLinkUrl.trim();

                    // If PDF selected, upload it first
                    if (paymentLinkPdf) {
                      const formData = new FormData();
                      formData.append('pdfFile', paymentLinkPdf);
                      formData.append('purchaseId', purchaseId);
                      formData.append('requirements', 'Payment Invoice/Receipt');

                      const uploadRes = await fetch('/api/my-content', {
                        method: 'POST',
                        body: formData
                      });

                      if (!uploadRes.ok) {
                        const uploadErr = await uploadRes.json().catch(() => ({}));
                        console.error('Upload error response:', uploadErr);
                        alert(`Upload failed: ${uploadErr.error || uploadErr.message || 'Unknown error'}`);
                        return;
                      }

                      const uploadData = await uploadRes.json();
                      if (uploadData.filePath) {
                        finalPaymentLink = uploadData.filePath;
                      } else if (uploadData.path) {
                        finalPaymentLink = uploadData.path;
                      } else if (uploadData.url) {
                        finalPaymentLink = uploadData.url;
                      } else if (uploadData.id) {
                        finalPaymentLink = `/api/my-content/${uploadData.id}`;
                      }
                    }

                    // Always save payment link to purchase (whether URL or PDF path)
                    const res = await fetch(`/api/purchases/${purchaseId}/payment-link`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ paymentLink: finalPaymentLink })
                    });

                    if (!res.ok) {
                      const body = await res.json().catch(() => ({}));
                      const serverMsg = body?.error || body?.message || `HTTP ${res.status}`;
                      alert(`Failed to save payment link: ${serverMsg}`);
                      return;
                    }

                    // Update local state
                    const idx = filteredPurchaseRequests.findIndex(p => p.id === purchaseId);
                    if (idx >= 0) {
                      (filteredPurchaseRequests[idx] as any).paymentLink = finalPaymentLink;
                    }

                    // Close modal
                    setPaymentLinkModalOpen(false);
                    setPaymentLinkUrl('');
                    setPaymentLinkPdf(null);
                    setPaymentLinkPurchaseId(null);

                    alert('Payment link saved successfully!');
                  } catch (err) {
                    console.error('Error saving payment link:', err);
                    alert('An error occurred while saving the payment link');
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Save Payment Link
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SuperAdminPurchasesSection;
"use client";

import React, { useState } from "react";

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
  messages, setMessages
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const statusLabelMap: Record<string, string> = {
    ongoing: "Mark as Ongoing",
    pendingPayment: "Move to Pending Payment",
    approved: "Approve",
    rejected: "Reject",
  };

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

        {/* Purchase Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "pending", "ongoing", "pendingPayment", "approved", "rejected"] as FilterType[]).map((tab) => (
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
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
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
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 max-w-[150px] truncate" title={request.customerEmail || ''}>
                            {request.customerEmail || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(request.priceCents)}
                          </div>
                          <div className="text-xs font-bold text-indigo-600">
                            Total: {formatCurrency(request.totalCents)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getContentTypeBadge(request.contentType, request)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(request.status || 'pending')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
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
                            <button
                              onClick={() => toggleRowExpansion(request.id)}
                              className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                              title="Toggle payment options"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${expandedRows[request.id] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows[request.id] && (
                        <tr>
                          <td colSpan={purchaseFilter === "pending" ? 8 : 7} className="px-4 py-2 bg-gray-50">
                            <div className="flex justify-end">
                              <div className="flex flex-col gap-2 w-full max-w-md">
                                <div className="flex flex-col">
                                  <label className="text-xs text-gray-500 mb-1">Payment Link</label>
                                  <div className="flex gap-2">
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
                                            credentials: 'same-origin',
                                          });

                                          let body: any = null;
                                          try {
                                            body = await res.json();
                                          } catch (e) {
                                            // ignore json parse errors
                                          }

                                          if (!res.ok) {
                                            const serverMsg = body?.error || body?.message || `HTTP ${res.status}`;
                                            console.error('Push link failed', { status: res.status, body });
                                            alert(`Failed to push link: ${serverMsg}`);
                                            return;
                                          }

                                          alert('Payment link pushed successfully');
                                        } catch (err) {
                                          console.error('Push link failed (network)', err);
                                          alert('Failed to push payment link (network error)');
                                        }
                                      }}
                                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 whitespace-nowrap"
                                    >
                                      Push Link
                                    </button>
                                  </div>
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
      
      {/* Confirmation Modal */}
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
    </section>
  );
};

export default SuperAdminPurchasesSection;
"use client";

import React from "react";

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
  confirmPurchaseStatusUpdate
  , messages, setMessages
}) => {
  const statusLabelMap: Record<string, string> = {
    ongoing: "Mark as Ongoing",
    pendingPayment: "Move to Pending Payment",
    approved: "Approve",
    rejected: "Reject",
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-emerald-600/5 to-teal-600/5"></div>
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-gray-800 via-green-800 to-emerald-800 bg-clip-text text-transparent">
            Purchase Requests
          </span>
        </h2>
      
        {/* Bulk Actions Toolbar - Only show for pending purchases */}
        {purchaseFilter === "pending" && filteredPurchaseRequests.length > 0 && (
          <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 shadow-sm">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isAllPurchasesSelected}
                onChange={toggleSelectAllPurchases}
                className="h-4 w-4 text-green-600 rounded focus:ring-green-500 transition-colors"
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
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 w-full">
          <div className="bg-white/60 backdrop-blur-sm p-4 lg:p-5 rounded-xl border border-gray-200/50 shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Total Requests</h3>
            <p className="text-xl lg:text-2xl font-bold text-gray-800">{purchaseStats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 lg:p-5 rounded-xl border border-yellow-200/50 shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-yellow-700 mb-1">Pending</h3>
            <p className="text-xl lg:text-2xl font-bold text-yellow-800">{purchaseStats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 lg:p-5 rounded-xl border border-green-200/50 shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-green-700 mb-1">Approved</h3>
            <p className="text-xl lg:text-2xl font-bold text-green-800">{purchaseStats.approved}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 lg:p-5 rounded-xl border border-red-200/50 shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-red-700 mb-1">Rejected</h3>
            <p className="text-xl lg:text-2xl font-bold text-red-800">{purchaseStats.rejected}</p>
          </div>
        </div>

        {/* Purchase Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50">
          {(["all", "pending", "ongoing", "pendingPayment", "approved", "rejected"] as FilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setPurchaseFilter(tab)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                purchaseFilter === tab
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50/50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "pending" && purchaseStats.pending > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  purchaseFilter === tab 
                    ? "bg-white text-green-500" 
                    : "bg-green-100 text-green-600"
                }`}>
                  {purchaseStats.pending}
                </span>
              )}
              {tab === "ongoing" && purchaseStats.ongoing > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-600">
                  {purchaseStats.ongoing}
                </span>
              )}
              {tab === "pendingPayment" && purchaseStats.pendingPayment > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-yellow-100 text-yellow-600">
                  {purchaseStats.pendingPayment}
                </span>
              )}
              {tab === "approved" && purchaseStats.approved > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  purchaseFilter === tab 
                    ? "bg-white text-green-500" 
                    : "bg-green-100 text-green-600"
                }`}>
                  {purchaseStats.approved}
                </span>
              )}
              {tab === "rejected" && purchaseStats.rejected > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-600">
                  {purchaseStats.rejected}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Purchase Requests List */}
        {filteredPurchaseRequests.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Purchase Requests Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">No purchase requests found with status: <span className="font-medium">{purchaseFilter}</span>. Requests will appear here as users make purchases.</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-200/50 rounded-2xl shadow-lg bg-white/50">
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="grid grid-cols-19 gap-4 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-1 flex justify-center">
                  {purchaseFilter === "pending" && (
                    <input 
                      type="checkbox" 
                      checked={isAllPurchasesSelected}
                      onChange={toggleSelectAllPurchases}
                      className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                  )}
                </div>
                <div className="col-span-4 flex items-center">WEBSITE NAME</div>
                <div className="col-span-2 flex justify-center">PRICE</div>
                <div className="col-span-2 flex justify-center">TOTAL</div>
                <div className="col-span-3 flex justify-center">CUSTOMER EMAIL</div>
                <div className="col-span-2 flex justify-center">CONTENT TYPE</div>
                <div className="col-span-2 flex justify-center">STATUS</div>
                <div className="col-span-2 flex justify-center">REQUESTED</div>
                <div className="col-span-1 flex justify-center">ACTIONS</div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-gray-100/50">
                {filteredPurchaseRequests.map((request, index) => (
                  <div key={request.id} className={`grid grid-cols-19 gap-4 px-6 py-4 hover:bg-green-50/50 items-center transition-colors ${
                    index % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/30'
                  }`}>
                    {/* Checkbox */}
                    <div className="col-span-1 flex justify-center">
                      {(request.status || 'pending') === 'pending' && (
                        <input 
                          type="checkbox" 
                          checked={(selectedPurchases || []).includes(request.id)}
                          onChange={() => togglePurchaseSelection(request.id)}
                          className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500" 
                        />
                      )}
                    </div>
                    
                    {/* Website Name */}
                    <div className="col-span-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                          {(request.websiteTitle || 'W').charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.websiteTitle || 'Untitled'}</div>
                          <div className="text-xs text-gray-500">ID: {request.websiteId || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="col-span-2 flex justify-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(request.priceCents)}
                      </div>
                    </div>
                    
                    {/* Total */}
                    <div className="col-span-2 flex justify-center">
                      <div className="text-sm font-bold text-green-600">
                        {formatCurrency(request.totalCents)}
                      </div>
                    </div>
                    
                    {/* Customer Email */}
                    <div className="col-span-3 flex justify-center">
                      <div className="text-sm text-gray-700 truncate max-w-[150px]" title={request.customerEmail || ''}>
                        {request.customerEmail || 'N/A'}
                      </div>
                    </div>
                    
                    {/* Content Type */}
                    <div className="col-span-2 flex justify-center">
                      {request.contentType === 'content' && (
                        <button
                          onClick={() => fetchContentDetails(request)}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 hover:from-blue-200 hover:to-blue-300 transition-all cursor-pointer transform hover:scale-105"
                          title="Click to view uploaded content details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          My Content
                        </button>
                      )}
                      {request.contentType === 'request' && (
                        <button
                          onClick={() => fetchContentDetails(request)}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border border-green-300 hover:from-green-200 hover:to-emerald-300 transition-all cursor-pointer transform hover:scale-105"
                          title="Click to view content request details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Request Content
                        </button>
                      )}
                      {!request.contentType && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
                          Not Selected
                        </span>
                      )}
                    </div>
                    
                    {/* Status */}
                    <div className="col-span-2 flex justify-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        (request.status || 'pending') === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : (request.status || 'pending') === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {(request.status || 'pending').toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Requested Date */}
                    <div className="col-span-2 flex justify-center">
                      <div className="text-sm text-gray-600">
                        {formatDate(request.createdAt)}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="col-span-1 flex justify-center">
                      {(request.status || 'pending') === 'pending' ? (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setConfirmationAction({ purchaseId: request.id, status: "approved" });
                              setShowConfirmationModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
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
                            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                            title="Reject Purchase"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">
                          {(request.status || 'pending') === 'approved' ? '✓ Approved' : '✗ Rejected'}
                        </div>
                      )}
                      {request.status === 'pending' && (
                        <button
                          onClick={() => {
                            setConfirmationAction({ purchaseId: request.id, status: "ongoing" });
                            setShowConfirmationModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
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
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
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
                          className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                          title="Mark as Approved (Payment Received)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {/* Payment Link input per request - shown for all rows */}
                    <div className="col-span-2 flex justify-center">
                      <div className="flex flex-col w-full max-w-xs">
                        <label className="text-xs text-gray-500 mb-1">Payment Link</label>
                        <textarea
                          value={messages?.[`paymentLink:${request.id}`] || ''}
                          onChange={(e) => setMessages && setMessages(prev => ({ ...prev, [`paymentLink:${request.id}`]: e.target.value }))}
                          placeholder="Enter payment link or gateway URL"
                          className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full"
                          rows={2}
                        />
                        <div className="mt-2 flex items-center gap-2">
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
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                          >
                            Push Link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">
              {confirmationAction?.status ? statusLabelMap[confirmationAction.status] ?? `Confirm ${confirmationAction.status}` : "Confirm Action"}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to {confirmationAction?.status ? (statusLabelMap[confirmationAction.status] ?? confirmationAction.status) : "perform this action"}?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-3 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // call the confirmation handler passed from parent (ensure it exists)
                  confirmPurchaseStatusUpdate && confirmPurchaseStatusUpdate();
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded"
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
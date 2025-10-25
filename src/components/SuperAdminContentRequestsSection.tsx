"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";

// Type definitions
type ContentRequest = {
  _id: string;
  websiteId: string;
  websiteTitle?: string;
  topic: string;
  wordCount?: number;
  customerId: string;
  customerEmail?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  contentRequest?: any;
};

type SuperAdminContentRequestsSectionProps = {
  requests: ContentRequest[];
  contentLoading: boolean;
  formatDate: (dateString?: string) => string;
};

const SuperAdminContentRequestsSection: React.FC<SuperAdminContentRequestsSectionProps> = ({
  requests,
  contentLoading,
  formatDate
}) => {
  const [selectedRequest, setSelectedRequest] = useState<ContentRequest | null>(null);
  // Open request and scroll the table into view, then show modal near top
  const openRequest = (req: ContentRequest) => {
    // scroll table into view
    try {
      const el = document.getElementById('content-requests-table');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      // ignore
    }
    // small timeout to allow scroll to happen before showing modal
    setTimeout(() => setSelectedRequest(req), 200);
  };
  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-violet-600/5 to-indigo-600/5"></div>
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-gray-800 via-purple-800 to-violet-800 bg-clip-text text-transparent">
            Content Requests
          </span>
        </h2>
        
        {contentLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600 text-sm">Loading content requests...</p>
            </div>
          </div>
        ) : (requests || []).length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Content Requests Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">There are currently no content requests to display. Users will see their requests appear here once submitted.</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-200/50 rounded-2xl shadow-lg bg-white/50">
                <div id="content-requests-table" className="overflow-x-auto relative">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Website</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Topic</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Word Count</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Created At</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Content Type</th>
                  </tr>
                </thead>
                <tbody>
                  {(requests || []).map((req, index) => (
                    <tr key={req._id} className={`hover:bg-purple-50/50 transition-colors border-b border-gray-100/50 ${
                      index % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/30'
                    }`}>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {req.websiteTitle || req.websiteId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="max-w-xs">
                          <p className="font-medium truncate" title={req.topic || ''}>{req.topic || 'No topic'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {req.wordCount ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {req.wordCount} words
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {req.customerEmail || <span className="text-gray-400 italic">No email</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          (req.status || 'pending') === "pending" ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200" :
                          (req.status || 'pending') === "approved" ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200" :
                          "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
                        }`}>
                          {(req.status || 'pending').charAt(0).toUpperCase() + (req.status || 'pending').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(req.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openRequest(req)}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 hover:opacity-90"
                        >
                          Request Content
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Modal: show selected request details */}
            {selectedRequest && typeof document !== 'undefined' && createPortal(
              <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-20 bg-transparent">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 mx-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Request Details</h3>
                    <button onClick={() => setSelectedRequest(null)} className="text-gray-500 hover:text-gray-700">Close</button>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Website</div>
                      <div className="text-sm font-medium text-gray-800">{selectedRequest.websiteTitle || selectedRequest.websiteId}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Topic</div>
                      <div className="text-sm text-gray-800">{selectedRequest.topic}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Word Count</div>
                        <div className="text-sm text-gray-800">{selectedRequest.wordCount ?? '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Customer Email</div>
                        <div className="text-sm text-gray-800">{selectedRequest.customerEmail ?? '—'}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="text-sm text-gray-800">{(selectedRequest.status || 'pending').charAt(0).toUpperCase() + (selectedRequest.status || 'pending').slice(1)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Created</div>
                      <div className="text-sm text-gray-800">{formatDate ? formatDate(selectedRequest.createdAt) : new Date(selectedRequest.createdAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Content Request Payload</div>
                      <pre className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-700 overflow-auto max-h-64">{JSON.stringify(selectedRequest.contentRequest ?? {}, null, 2)}</pre>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Close</button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default SuperAdminContentRequestsSection;
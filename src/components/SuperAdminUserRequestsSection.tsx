// src/components/SuperAdminUserRequestsSection.tsx

import React from 'react';

// Type definitions
type FilterType = "all" | "pending" | "approved" | "rejected" | "paused";
type UserAccessRequest = {
    _id: string;
    email: string;
    phone: string;
    country: string;
    traffic: string;
    numberOfWebsites: string;
    role?: "advertiser" | "publisher";
    message?: string;
    status: "pending" | "approved" | "rejected" | "paused";
    createdAt: string;
};

type Props = {
    userRequests: UserAccessRequest[];
    userRequestsLoading: boolean;
    selectedRequests: string[];
    isAllRequestsSelected: boolean;
    userRequestFilter: FilterType;
    setUserRequestFilter: (filter: FilterType) => void;
    toggleSelectAllRequests: () => void;
    toggleRequestSelection: (id: string) => void;
    approveSelectedRequests: () => void;
    updateRequestStatus: (id: string, status: "approved" | "rejected" | "paused") => Promise<void>;
    formatDate: (dateString?: string) => string;
    deleteRequest: (id: string) => Promise<void>; // Add delete function
};

const SuperAdminUserRequestsSection: React.FC<Props> = ({
    userRequests,
    userRequestsLoading,
    selectedRequests,
    isAllRequestsSelected,
    userRequestFilter,
    setUserRequestFilter,
    toggleSelectAllRequests,
    toggleRequestSelection,
    approveSelectedRequests,
    updateRequestStatus,
    formatDate,
    deleteRequest, // Add delete function
}) => {
    // Function to toggle user status between approved and paused
    const toggleUserStatus = async (requestId: string, currentStatus: "approved" | "paused") => {
        const newStatus = currentStatus === "approved" ? "paused" : "approved";
        await updateRequestStatus(requestId, newStatus);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-gray-800">User Access Requests</h2>
                    <p className="text-sm text-gray-600 mt-1">Approve or reject user registration requests</p>
                </div>
                <div className="flex gap-2">
                    {/* Filter buttons */}
                    <button
                        onClick={() => setUserRequestFilter("pending")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${userRequestFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setUserRequestFilter("approved")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${userRequestFilter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setUserRequestFilter("rejected")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${userRequestFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Rejected
                    </button>
                    <button
                        onClick={() => setUserRequestFilter("paused")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${userRequestFilter === 'paused' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Paused
                    </button>
                    <button
                        onClick={() => setUserRequestFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${userRequestFilter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                </div>
                {selectedRequests.length > 0 && userRequestFilter !== "approved" && userRequestFilter !== "rejected" && (
                    <button
                        onClick={approveSelectedRequests}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                    >
                        Approve Selected ({selectedRequests.length})
                    </button>
                )}
            </div>

            {userRequestsLoading ? (
                <div className="flex justify-center py-12">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-500 mx-auto"></div>
                        <p className="text-blue-600 font-medium">Loading user requests...</p>
                    </div>
                </div>
            ) : userRequests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No User Requests Found</h3>
                    <p className="text-gray-500">There are no user access requests to display for the current filter.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                    {userRequestFilter !== "approved" && userRequestFilter !== "rejected" && (
                                        <input
                                            type="checkbox"
                                            checked={isAllRequestsSelected}
                                            onChange={toggleSelectAllRequests}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    )}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traffic</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Websites</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {userRequests.map((request) => (
                                <tr key={request._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap w-10">
                                        {request.status !== "approved" && request.status !== "rejected" && (
                                            <input
                                                type="checkbox"
                                                checked={selectedRequests.includes(request._id)}
                                                onChange={() => toggleRequestSelection(request._id)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{request.email}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">{request.role}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{request.phone}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{request.country}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{request.traffic}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{request.numberOfWebsites}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            request.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {request.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(request.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {request.status === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => updateRequestStatus(request._id, "approved")}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => updateRequestStatus(request._id, "rejected")}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {request.status === "approved" && (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-600">Active</span>
                                                    <button
                                                        onClick={() => toggleUserStatus(request._id, "approved")}
                                                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                    >
                                                        <span className="sr-only">Pause user</span>
                                                        <span
                                                            className={`${
                                                                'translate-x-6'
                                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                        />
                                                    </button>
                                                </div>
                                            )}
                                            {request.status === "paused" && (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-600">Paused</span>
                                                    <button
                                                        onClick={() => toggleUserStatus(request._id, "paused")}
                                                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                    >
                                                        <span className="sr-only">Resume user</span>
                                                        <span
                                                            className={`${
                                                                'translate-x-1'
                                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                        />
                                                    </button>
                                                </div>
                                            )}
                                            {(request.status === "approved" || request.status === "paused") && (
                                                <button
                                                    onClick={() => updateRequestStatus(request._id, "rejected")}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SuperAdminUserRequestsSection;
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function AdRequestsSection({ 
  adRequests, 
  loading, 
  error, 
  fetchAdRequests
}: {
  adRequests: any[];
  loading: boolean;
  error: string;
  fetchAdRequests: () => void;
}) {
  return (
    <div>
      {/* Table Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdRequests}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-500">{adRequests.length} ad requests found</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading ad requests...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Ad Requests</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchAdRequests}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {adRequests.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v1a1 1 0 01-1 1h-1v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Ad Requests Yet</h3>
              <p className="text-gray-600 mb-4">Start creating advertising campaigns to see your ad requests here</p>
              <button
                onClick={() => {
                  // This would need to be handled by the parent component
                  alert("Please navigate to the purchases tab to create ad requests");
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium text-sm"
              >
                View My Purchases
              </button>
            </div>
          ) : (
            <div>
              {/* Table Header with Tooltips */}
              <div className="grid grid-cols-16 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-4 flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">WEBSITE</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Website domain for which the ad request was made</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="col-span-6 flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">MESSAGE</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Custom message or instructions for the ad placement</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="col-span-2 flex justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">REQUEST DATE</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Date when the ad request was submitted</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="col-span-2 flex justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">STATUS</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Current status of the ad request</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="col-span-2 flex justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">ACTIONS</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View details or edit the ad request</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {adRequests.map((request, index) => {
                  return (
                    <div key={request._id || index} className="grid grid-cols-16 gap-4 px-6 py-4 hover:bg-gray-50 items-center">
                      {/* Website Info */}
                      <div className="col-span-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                            {(request.websiteTitle || request.websiteId || 'W').charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.websiteTitle || request.websiteId || 'Unknown Website'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Ad Campaign
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Message */}
                      <div className="col-span-6">
                        <div className="text-sm text-gray-900 truncate max-w-[300px]" title={request.message}>
                          {request.message || 'No message provided'}
                        </div>
                      </div>
                      
                      {/* Request Date */}
                      <div className="col-span-2 flex justify-center">
                        <div className="text-sm text-gray-900">
                          {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="col-span-2 flex justify-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status || 'pending'}
                        </span>
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex space-x-2">
                          <button
                            className="text-purple-600 hover:text-purple-800 p-1"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            className="text-gray-500 hover:text-gray-700 p-1"
                            title="Edit Request"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
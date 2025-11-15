import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ContentRequestsSection({ 
  contentRequests, 
  loading, 
  error, 
  fetchContentRequests
}: {
  contentRequests: any[];
  loading: boolean;
  error: string;
  fetchContentRequests: () => void;
}) {
  // Function to redirect to marketplace
  const redirectToMarketplace = () => {
    // Dispatch a custom event to switch tabs to marketplace
    const event = new CustomEvent('switchTab', { detail: 'marketplace' });
    window.dispatchEvent(event);
    
    // Also update the URL to reflect the marketplace tab
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'marketplace');
    window.history.pushState({}, '', url);
  };

  return (
    <div>
      {/* Table Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={fetchContentRequests}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-500">{contentRequests.length} content requests found</span>
        </div>
        <button 
          onClick={redirectToMarketplace}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium text-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Content Request
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading content requests...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Content Requests</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchContentRequests}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {contentRequests.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Requests Yet</h3>
              <p className="text-gray-600 mb-4">Request custom content for your websites to boost engagement</p>
              <button 
                onClick={redirectToMarketplace}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium text-sm"
              >
                Create Content Request
              </button>
            </div>
          ) : (
            <div>
              {/* Table Header with Tooltips */}
              <div className="grid grid-cols-18 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-4 flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">TOPIC</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Topic or subject of the requested content</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="col-span-4 flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">WEBSITE</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Website domain for which the content is requested</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="col-span-3 flex justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">CONTENT TYPE</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Type of content requested (article, blog post, etc.)</p>
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
                        <p>Date when the content request was submitted</p>
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
                        <p>Current status of the content request</p>
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
                        <p>View details or edit the content request</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="col-span-1"></div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {contentRequests.map((request, index) => {
                  return (
                    <div key={request._id || index} className="grid grid-cols-18 gap-4 px-6 py-4 hover:bg-gray-50 items-center">
                      {/* Topic */}
                      <div className="col-span-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                            {(request.topic || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.topic || 'Content Request'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {request.description ? `${request.description.substring(0, 30)}...` : 'No description'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Website */}
                      <div className="col-span-4">
                        <div className="text-sm text-gray-900">
                          {request.websiteTitle || request.websiteId || 'Unknown Website'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.websiteUrl || 'No URL provided'}
                        </div>
                      </div>
                      
                      {/* Content Type */}
                      <div className="col-span-3 flex justify-center">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                          {request.contentType || 'Article'}
                        </span>
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
                          request.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : request.status === 'cancelled'
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
                            className="text-orange-600 hover:text-orange-800 p-1"
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
                          {request.status === 'completed' && (
                            <button
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Download Content"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* More Options */}
                      <div className="col-span-1 flex justify-end">
                        <button className="text-gray-400 hover:text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

export default function AnalyticsSection({ 
  stats,
  websites
}: {
  stats: {
    total: number;
    purchases: number;
    adRequests: number;
    contentRequests: number;
  };
  websites: any[];
}) {
  return (
    <div>
      {/* Analytics Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-500">Performance Overview</span>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download your purchase or analytics data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <select className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select date range to filter analytics results</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Stats Cards */}
      <TooltipProvider>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium text-gray-500 mb-1 cursor-help">Total Purchases</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of link orders placed through your account</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.purchases}</p>
                <p className="text-xs text-green-600 font-medium mt-1">+12% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium text-gray-500 mb-1 cursor-help">Ad Requests</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total advertising campaign requests you've made</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.adRequests}</p>
                <p className="text-xs text-blue-600 font-medium mt-1">+5% from last month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium text-gray-500 mb-1 cursor-help">Content Requests</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total content pieces requested from Linkfro writers</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.contentRequests}</p>
                <p className="text-xs text-orange-600 font-medium mt-1">+8% from last month</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium text-gray-500 mb-1 cursor-help">Available Assets</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total verified domains available for new orders</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-green-600 font-medium mt-1">+3% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-lg font-medium text-gray-900 cursor-help">Recent Activity</h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>Displays latest actions like new purchases, payments, and approvals</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">New Purchase</p>
                    <p className="text-sm text-gray-500">TechBlog.com purchased</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">2 hours ago</span>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Ad Request Sent</p>
                    <p className="text-sm text-gray-500">Campaign created for MarketingHub</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">5 hours ago</span>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Content Request</p>
                    <p className="text-sm text-gray-500">Article requested for SalesWebsite</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">1 day ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Websites */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-lg font-medium text-gray-900 cursor-help">Top Performing Websites</h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>Websites delivering highest traffic or SEO value</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="divide-y divide-gray-200">
            {websites
              .filter(website => website.OrganicTraffic !== undefined && website.OrganicTraffic !== null)
              .sort((a, b) => (b.OrganicTraffic || 0) - (a.OrganicTraffic || 0))
              .slice(0, 3)
              .map((website, index) => (
                <div key={website._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{website.title}</p>
                        <p className="text-sm text-gray-500">DA: {website.DA || 0} | DR: {website.DR || 0}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${(website.priceCents / 100).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{website.OrganicTraffic || 0} traffic</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
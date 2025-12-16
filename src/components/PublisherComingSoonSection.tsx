export default function PublisherComingSoonSection({ activeTab }: { activeTab: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-6 text-blue-600">
        {activeTab === "analytics" && "Analytics Overview"}
        {activeTab === "earnings" && "Earnings Report"}
        {activeTab === "settings" && "Publisher Settings"}
      </h2>
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
          {activeTab === "analytics" && "analytics"}
          {activeTab === "earnings" && "monetization_on"}
          {activeTab === "settings" && "settings"}
        </span>
        <p className="text-gray-500">
          {activeTab === "analytics" && "Analytics features coming soon..."}
          {activeTab === "earnings" && "Earnings tracking coming soon..."}
          {activeTab === "settings" && "Settings panel coming soon..."}
        </p>
      </div>
    </div>
  );
}
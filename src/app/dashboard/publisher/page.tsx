"use client";

import { useEffect, useState } from "react";
import PublisherSidebar from "@/components/PublisherSidebar";
import PublisherDashboardSection from "@/components/PublisherDashboardSection";
import PublisherWebsitesSection from "@/components/PublisherWebsitesSection";
import PublisherAddWebsiteSection from "@/components/PublisherAddWebsiteSection";
import PublisherComingSoonSection from "@/components/PublisherComingSoonSection";

// Define the categories as requested with mapping to backend enum values
const CATEGORIES = [
  { id: 1, name: "Finance, Insurance & Investment" },
  { id: 2, name: "Crypto, Blockchain, Bitcoin & Digital Assets", backendValue: "business" },
  { id: 3, name: "Health, Wellness, Fitness & Personal Care", backendValue: "buiness" },
  { id: 4, name: "Software, SaaS, Technology & IT Solutions", backendValue: "business" },
  { id: 5, name: "Business, Marketing, PR & Communication", backendValue: "business" },
  { id: 6, name: "Travel, Tourism, Adventure & Hospitality", backendValue: "business" },
  { id: 7, name: "Law, Legal Services, Attorneys & Compliance", backendValue: "business" },
  { id: 8, name: "Automotive, Cars, Bikes & Electric Vehicles (EVs)", backendValue: "business" },
  { id: 9, name: "iGaming, Casino, Betting, Gambling & Adult Niches", backendValue: "entertainment" },
  { id: 10, name: "Education, E-Learning, Training & Career Development", backendValue: "educational" },
  { id: 11, name: "Real Estate, Property, Home Improvement & Garden", backendValue: "business" },
  { id: 12, name: "Food, Recipes, Cooking & Culinary Lifestyle", backendValue: "business" },
  { id: 13, name: "Sports, Fitness, Training & Active Lifestyle", backendValue: "entertainment" },
  { id: 14, name: "Clothing, Fashion, Style & Apparel", backendValue: "business" },
  { id: 15, name: "Beauty, Cosmetics, Skincare & Personal Style", backendValue: "business" },
  { id: 16, name: "Parenting, Family, Kids & Childcare", backendValue: "business" },
  { id: 17, name: "Wedding, Events, Parties & Celebrations", backendValue: "business" },
  { id: 18, name: "Lifestyle, General Interest & Multi-Niche Blogs", backendValue: "blog" },
  { id: 19, name: "Photography, Visual Arts & Creative Media", backendValue: "entertainment" },
  { id: 20, name: "Hobbies, Leisure, Crafts & Entertainment", backendValue: "entertainment" },
  { id: 21, name: "Women's Lifestyle, Fashion & Inspiration", backendValue: "business" },
  { id: 22, name: "Men's Lifestyle, Fashion & Grooming", backendValue: "business" },
  { id: 23, name: "Media, Publishing, Literature & Books", backendValue: "blog" },
  { id: 24, name: "Music, Movies, Film & Entertainment", backendValue: "entertainment" },
  { id: 25, name: "Gadgets, Electronics, Hardware & Consumer Tech", backendValue: "business" },
  { id: 26, name: "Social Media, Influencers & Digital Trends", backendValue: "blog" },
  { id: 27, name: "News, Blogs, Magazines & Current Affairs", backendValue: "blog" },
  { id: 28, name: "Promotional Products, Gifts & Corporate Merchandise", backendValue: "business" },
  { id: 29, name: "Catering, Food Services & Hospitality Industry", backendValue: "business" },
  { id: 30, name: "Animals, Pets, Wildlife & Veterinary Care", backendValue: "business" },
  { id: 31, name: "Construction, Architecture, Engineering & Building", backendValue: "business" },
  { id: 32, name: "Sustainability, Eco-Friendly & Green Living", backendValue: "business" },
  { id: 33, name: "Games, Toys, Kids & Children's Products", backendValue: "entertainment" },
  { id: 34, name: "Private SEO Blog Networks (PSBN)", backendValue: "blog" }
];

export default function PublisherDashboard() {
  const [mySites, setMySites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "websites" | "add-website" | "analytics" | "earnings" | "settings">("websites");
  const [editingWebsite, setEditingWebsite] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '', // Keep as string for form submission
    price: '',
    DA: '',
    PA: '',
    Spam: '',
    OrganicTraffic: '',
    DR: '',
    RD: '',
    tags: '',
    primaryCountry: '', // Add primaryCountry field
    trafficValue: '',        // <-- Add this
    locationTraffic: '',     // <-- Add this
  greyNicheAccepted: false,   // <-- default to false so publisher sees No by default
    specialNotes: '',        // <-- Add this
    primeTrafficCountries: '' // Add prime traffic countries field
  });
  const [formLoading, setFormLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  // Add state for success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Add state for delete confirmation popup
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  // Add event listener for tab switching
  useEffect(() => {
    const handleTabSwitch = (event: CustomEvent) => {
      if (event.detail === 'add-website') {
        setActiveTab('add-website');
      }
    };

    window.addEventListener('switchTab', handleTabSwitch as EventListener);
    return () => {
      window.removeEventListener('switchTab', handleTabSwitch as EventListener);
    };
  }, [setActiveTab]);

  useEffect(() => {
    const newStats = {
      total: mySites.length,
      pending: mySites.filter((site: any) => site.status === 'pending').length,
      approved: mySites.filter((site: any) => site.status === 'approved').length,
      rejected: mySites.filter((site: any) => site.status === 'rejected').length
    };
    setStats(newStats);
  }, [mySites]);

  // Reset form when switching away from add-website tab
  useEffect(() => {
    if (activeTab !== 'add-website') {
      resetForm();
    }
  }, [activeTab]);

  function refresh() {
    setLoading(true);
    fetch("/api/websites?owner=me")
      .then((r) => r.json())
      .then((sitesData) => {
        const rawSites = sitesData.websites || sitesData || [];
        const normalizedSites = Array.isArray(rawSites)
          ? rawSites
            .map((s: any) => {
              let siteId = null;
              if (s._id) {
                if (typeof s._id === 'string') {
                  siteId = s._id;
                } else if (typeof s._id === 'object') {
                  if (s._id.$oid) {
                    siteId = s._id.$oid;
                  } else if (s._id.toString) {
                    siteId = s._id.toString();
                  }
                }
              } else if (s.id) {
                siteId = s.id;
              }

              if (!siteId) {
                console.error('Warning: Site is missing ID:', JSON.stringify(s));
                return null;
              }

              return {
                ...s,
                _id: siteId,
                priceCents:
                  typeof s.priceCents === "number" &&
                    !Number.isNaN(s.priceCents)
                    ? s.priceCents
                    : typeof s.price === "number" &&
                      !Number.isNaN(s.price)
                      ? Math.round(s.price * 100)
                      : 0,
                available: s.available !== undefined ? s.available : true,
              };
            })
            .filter(Boolean)
          : [];
        setMySites(normalizedSites.filter((site: any) => site._id));
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        alert("Failed to load data");
      })
      .finally(() => setLoading(false));
  }

  async function removeSite(id: string) {
    if (!id || id === 'undefined' || id === 'null') {
      setDeleteError('Cannot delete: Invalid website ID');
      return;
    }

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isValidObjectId) {
      setDeleteError('Cannot delete: Invalid website ID format');
      return;
    }

    // Instead of using confirm(), show custom popup
    setSiteToDelete(id);
    setShowDeleteConfirm(true);
  }

  // Function to confirm deletion after popup
  async function confirmDelete() {
    if (!siteToDelete) return;
    
    setShowDeleteConfirm(false);
    setDeleteLoading(siteToDelete);
    setDeleteError(null);
    
    try {
      const res = await fetch(`/api/websites/${siteToDelete}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMySites((prevSites) => prevSites.filter((site: any) => site._id !== siteToDelete));
        // Replace alert with success message
        setSuccessMessage("Website deleted successfully!");
        // Clear the success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        if (res.status === 401) setDeleteError("Please log in to delete websites");
        else if (res.status === 403) setDeleteError("You don't have permission to delete this website");
        else if (res.status === 404) {
          setDeleteError("Website not found");
          setMySites((prevSites) => prevSites.filter((site: any) => site._id !== siteToDelete));
        } else setDeleteError("Failed to delete website: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      setDeleteError("Network error occurred. Please check your connection and try again.");
    } finally {
      setDeleteLoading(null);
      setSiteToDelete(null);
    }
  }

  // Function to cancel deletion
  function cancelDelete() {
    setShowDeleteConfirm(false);
    setSiteToDelete(null);
    setDeleteError(null);
  }

  function resetForm() {
    setFormData({
      title: '',
      url: '',
      description: '',
      category: '',
      price: '',
      DA: '',
      PA: '',
      Spam: '',
      OrganicTraffic: '',
      DR: '',
      RD: '',
      tags: '',
      primaryCountry: '', // Add primaryCountry field
      trafficValue: '',        // <-- Add this
      locationTraffic: '',     // <-- Add this
  greyNicheAccepted: false,   // <-- default to false
      specialNotes: '',        // <-- Add this
      primeTrafficCountries: '' // Add prime traffic countries field
    });
    setEditingWebsite(null);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target as HTMLInputElement & { name: string; value: any };
    // If this is the greyNicheAccepted select, convert 'true'/'false' strings to boolean
    if (name === 'greyNicheAccepted') {
      const boolVal = value === 'true' ? true : value === 'false' ? false : undefined;
      setFormData(prev => ({ ...prev, [name]: boolVal }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // Function to convert comma-separated category IDs to selected IDs array
  function getCategoryIdsFromString(categoryString: string): number[] {
    if (!categoryString) return [];
    return categoryString.split(',').map(Number).filter(Boolean);
  }

  // Function to handle editing a website with multiple categories
  function editWebsite(website: any) {
    setEditingWebsite(website);
    
    // Handle category field - convert array to comma-separated string if needed
    let categoryValue = '';
    if (website.category) {
      if (Array.isArray(website.category)) {
        categoryValue = website.category.join(',');
      } else {
        categoryValue = website.category;
      }
    }
    
    // Handle prime traffic countries field - convert array to comma-separated string if needed
    let primeTrafficCountriesValue = '';
    if (website.primeTrafficCountries) {
      if (Array.isArray(website.primeTrafficCountries)) {
        primeTrafficCountriesValue = website.primeTrafficCountries.join(',');
      } else {
        primeTrafficCountriesValue = website.primeTrafficCountries;
      }
    }
    
    setFormData({
      title: website.title,
      url: website.url,
      description: website.description,
      category: categoryValue,
      price: (((website as any).originalPriceCents != null ? (website as any).originalPriceCents : website.priceCents) / 100).toString(),
      DA: website.DA?.toString() || '',
      PA: website.PA?.toString() || '',
      Spam: website.Spam?.toString() || '',
      OrganicTraffic: website.OrganicTraffic?.toString() || '',
      DR: website.DR?.toString() || '',
  RD: website.RD != null ? String(website.RD) : '',
      tags: website.tags || '',
      primaryCountry: website.primaryCountry || '', // Add primaryCountry field
      trafficValue: website.trafficValue?.toString() || '',        // <-- Add this
      locationTraffic: website.locationTraffic?.toString() || '',     // <-- Add this
  greyNicheAccepted: website.greyNicheAccepted != null ? Boolean(website.greyNicheAccepted) : false,   // <-- Add this
      specialNotes: website.specialNotes || '',        // <-- Add this
      primeTrafficCountries: primeTrafficCountriesValue // Add prime traffic countries field
    });
    setActiveTab('add-website');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Process category data to convert from comma-separated string to array
      let processedCategory: string[] = [];
      if (typeof formData.category === 'string' && formData.category.includes(',')) {
        processedCategory = formData.category.split(',').map(cat => cat.trim()).filter(Boolean);
      } else if (typeof formData.category === 'string' && formData.category.trim()) {
        processedCategory = [formData.category.trim()];
      } else if (Array.isArray(formData.category)) {
        processedCategory = formData.category;
      }

      // Ensure greyNicheAccepted is a boolean in submitted payload
      const submitData = {
        ...formData,
        greyNicheAccepted: formData.greyNicheAccepted === true ? true : false,
        category: processedCategory,
        priceCents: Math.round(parseFloat(formData.price) * 100),
        DA: formData.DA ? parseInt(formData.DA) : undefined,
        PA: formData.PA ? parseInt(formData.PA) : undefined,
        Spam: formData.Spam ? parseInt(formData.Spam) : undefined,
        OrganicTraffic: formData.OrganicTraffic ? parseInt(formData.OrganicTraffic) : undefined,
        DR: formData.DR ? parseInt(formData.DR) : undefined
      };

      let res;
      if (editingWebsite) {
        // Update existing website
        res = await fetch(`/api/websites/${editingWebsite._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });
      } else {
        // Create new website
        res = await fetch('/api/websites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });
      }

      if (res.ok) {
        // Replace alert with success message
        setSuccessMessage(editingWebsite ? 'Website updated successfully!' : 'Website submitted for approval!');
        // Clear the success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        setActiveTab('websites');
        refresh();
      } else {
        const error = await res.json();
        alert('Error: ' + (error.error || 'Failed to save website'));
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setFormLoading(false);
    }
  }

  function getStatusBadge(status: string, rejectionReason?: string) {
    const baseClass = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "approved":
        return <span className={`${baseClass} bg-green-100 text-green-800 border border-green-200`}>Approved</span>;
      case "rejected":
        return (
          <div className="flex items-center gap-2">
            <span className={`${baseClass} bg-red-100 text-red-800 border border-red-200`}>Rejected</span>
            {rejectionReason && (
              <div className="group relative">
                <span className="text-red-500 cursor-help text-sm bg-red-50 rounded-full w-5 h-5 flex items-center justify-center">?</span>
                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                  <strong>Reason:</strong> {rejectionReason}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <span className={`${baseClass} bg-yellow-100 text-yellow-800 border border-yellow-200`}>Pending Review</span>;
    }
  }

  function formatPrice(cents?: number) {
    if (!cents || isNaN(cents)) return "$0.00";
    return `$${(cents / 100).toFixed(2)}`;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: 'var(--accent-primary)'}}></div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen" style={{backgroundColor: 'var(--base-primary)'}}>
      <PublisherSidebar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />
      
      <main className="flex-1 overflow-x-hidden">
        <div className="p-6">
          {/* Success Message Popup */}
          {successMessage && (
            <div className="fixed top-4 right-4 z-50">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Success! </strong>
                <span className="block sm:inline">{successMessage}</span>
              </div>
            </div>
          )}
          
          {/* Delete Confirmation Popup */}
          {showDeleteConfirm && (
            <div 
              className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              style={{ backgroundColor: "rgba(13, 17, 23, 0.3)" }}
            >
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-red-600">Confirm Delete</h3>
                  <button
                    onClick={cancelDelete}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-gray-600">Are you sure you want to delete this website? This action cannot be undone.</p>
                </div>
                {deleteError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {deleteError}
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold" style={{color: 'var(--secondary-primary)'}}>
              {activeTab === "dashboard" && "Publisher Dashboard"}
              {activeTab === "websites" && "My Websites"}
              {activeTab === "add-website" && "Add New Website"}
              {activeTab === "analytics" && "Analytics"}
              {activeTab === "earnings" && "Earnings"}
              {activeTab === "settings" && "Settings"}
            </h1>
            {activeTab === "websites" && (
              <p className="mt-1" style={{color: 'var(--secondary-lighter)'}}>Manage your websites and track their approval status</p>
            )}
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <PublisherDashboardSection 
              stats={stats}
              mySites={mySites}
              setActiveTab={setActiveTab}
              getStatusBadge={getStatusBadge}
              formatPrice={formatPrice}
            />
          )}

          {/* Websites Tab */}
          {activeTab === "websites" && (
            <PublisherWebsitesSection
              mySites={mySites}
              refresh={refresh}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              editWebsite={editWebsite}
              removeSite={removeSite}
              deleteLoading={deleteLoading}
              getStatusBadge={getStatusBadge}
              formatPrice={formatPrice}
            />
          )}

          {/* Add Website Tab */}
          {activeTab === "add-website" && (
            <PublisherAddWebsiteSection
              editingWebsite={editingWebsite}
              formData={formData}
              handleFormChange={handleFormChange}
              handleSubmit={handleSubmit}
              formLoading={formLoading}
              resetForm={resetForm}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Other tabs with coming soon messages */}
          {(activeTab === "analytics" || activeTab === "earnings" || activeTab === "settings") && (
            <PublisherComingSoonSection activeTab={activeTab} />
          )}
        </div>
      </main>
    </div>
  );
}
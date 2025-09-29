import React, { useState, useEffect } from "react";
import useCountries from "../hooks/useCountries";
import { motion, AnimatePresence } from "framer-motion";
import { AddWebsiteForm } from "@/components/ui/add-website-form";

type Website = {
  _id: string;
  title: string;
  url: string;
  description: string;
  priceCents: number;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  clicks?: number;
  DA?: number;
  PA?: number;
  Spam?: number;
  OrganicTraffic?: number;
  DR?: number;
  RD?: string;
  category?: string | string[]; // Updated to accept both string and array
  tags?: string;
  primaryCountry?: string; // Add primaryCountry field
};

// Define the categories as requested with mapping to backend enum values
const CATEGORIES = [
  { id: 1, name: "Finance, Insurance & Investment", backendValue: "business" },
  { id: 2, name: "Crypto, Blockchain, Bitcoin & Digital Assets", backendValue: "business" },
  { id: 3, name: "Health, Wellness, Fitness & Personal Care", backendValue: "business" },
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

export default function PublisherAddWebsiteSection({ 
  editingWebsite,
  formData,
  handleFormChange,
  handleSubmit,
  formLoading,
  resetForm,
  setActiveTab
}: {
  editingWebsite: Website | null;
  formData: {
    title: string;
    url: string;
    description: string;
    category: string | string[];
    price: string;
    DA: string;
    PA: string;
    Spam: string;
    OrganicTraffic: string;
    DR: string;
    RD: number | string;
    primaryCountry?: string;
    trafficValue?: string;        
    locationTraffic?: string;     
    greyNicheAccepted?: boolean;   
    specialNotes?: string;        
    primeTrafficCountries?: string | string[]; // Add prime traffic countries field
    status?: "pending" | "approved" | "rejected"; // Add status field
  };
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  formLoading: boolean;
  resetForm: () => void;
  setActiveTab: (tab: "dashboard" | "websites" | "add-website" | "analytics" | "earnings" | "settings") => void;
}) {
  // State for showing the multi-step form or the original form
  const [useMultiStepForm, setUseMultiStepForm] = useState(true);

  // Handle form submission from the multi-step form
  const handleMultiStepSubmit = (data: any) => {
    // Map the multi-step form data back to the original form structure
    const eventMock = {
      target: {
        name: "title",
        value: data.domainName
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    // Update each field using the existing handleFormChange function
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "title", value: data.domainName } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "url", value: data.websiteUrl } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "description", value: data.description } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "category", value: data.category } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "price", value: data.price } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "DA", value: data.DA } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "PA", value: data.PA } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "Spam", value: data.spam } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "OrganicTraffic", value: data.organicTraffic } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "DR", value: data.DR } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "RD", value: data.rdLink } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "trafficValue", value: data.trafficValue } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "locationTraffic", value: data.locationTraffic } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "greyNicheAccepted", value: data.greyNicheAccepted === "true" ? "true" : "false" } });
    handleFormChange({ ...eventMock, target: { ...eventMock.target, name: "specialNotes", value: data.specialNotes } });
    
    // Handle primeTrafficCountries as array
    handleFormChange({ 
      ...eventMock, 
      target: { 
        ...eventMock.target, 
        name: "primeTrafficCountries", 
        value: Array.isArray(data.primeTrafficCountries) 
          ? data.primeTrafficCountries.join(',') 
          : data.primeTrafficCountries 
      } 
    });
    
    // Set status to pending for new submissions
    if (!editingWebsite) {
      handleFormChange({ 
        ...eventMock, 
        target: { 
          ...eventMock.target, 
          name: "status", 
          value: "pending" 
        } 
      });
    }
    
    // Submit the form
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  // If we're using the multi-step form, we can hide the original form
  if (useMultiStepForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8"
      >
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingWebsite ? 'Edit Website' : 'Add New Website'}
          </h2>
          <div className="flex gap-2">
            {editingWebsite && (
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors duration-200"
              >
                Cancel Edit
              </button>
            )}
            <button
              onClick={() => setUseMultiStepForm(false)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors duration-200"
            >
              Use Original Form
            </button>
          </div>
        </div>
        
        {/* Multi-step form component */}
        <AddWebsiteForm 
          editingWebsite={editingWebsite}
          onSubmit={handleMultiStepSubmit}
          onCancel={() => {
            resetForm();
            setActiveTab('websites');
          }}
        />
      </motion.div>
    );
  }

  // Original form implementation
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>(() => {
    // Initialize from formData.category - handle different possible data types
    if (!formData.category) return [];
    
    // Handle case where category is already an array (from editing)
    if (Array.isArray(formData.category)) {
      return formData.category.map(name => {
        const category = CATEGORIES.find(cat => cat.name === name);
        return category ? category.id : null;
      }).filter((id): id is number => id !== null);
    }
    
    // Handle case where category is a string (comma-separated)
    if (typeof formData.category === 'string') {
      return formData.category.split(',').map(name => {
        const trimmedName = name.trim();
        const category = CATEGORIES.find(cat => cat.name === trimmedName);
        return category ? category.id : null;
      }).filter((id): id is number => id !== null);
    }
    
    // Fallback for any other case
    return [];
  });

  // Search term for category modal
  const [categorySearch, setCategorySearch] = useState('');

  // State for prime traffic countries
  const [primeTrafficCountries, setPrimeTrafficCountries] = useState<string[]>(() => {
    // Initialize from formData.primeTrafficCountries - handle different possible data types
    if (!formData.primeTrafficCountries) return [];
    
    // Handle case where primeTrafficCountries is already an array
    if (Array.isArray(formData.primeTrafficCountries)) {
      return formData.primeTrafficCountries;
    }
    
    // Handle case where primeTrafficCountries is a string (comma-separated)
    if (typeof formData.primeTrafficCountries === 'string') {
      return formData.primeTrafficCountries.split(',').map(name => name.trim()).filter(Boolean);
    }
    
    // Fallback for any other case
    return [];
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // useCountries hook provides cached countries + loading flag
  // this avoids multiple components fetching the same resource repeatedly
  // and speeds up subsequent navigations by using sessionStorage
  const { countries: allCountries, loading: loadingCountries } = useCountries();

  // Filter countries based on search term
  const filteredCountries = allCountries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle adding a country
  const addCountry = (countryName: string) => {
    if (!primeTrafficCountries.includes(countryName)) {
      const newCountries = [...primeTrafficCountries, countryName];
      setPrimeTrafficCountries(newCountries);
      
      // Update formData
      handleFormChange({
        target: {
          name: 'primeTrafficCountries',
          value: newCountries.join(',')
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
    setSearchTerm('');
    setShowCountryDropdown(false);
  };
  
  // Handle removing a country
  const removeCountry = (countryName: string) => {
    const newCountries = primeTrafficCountries.filter(name => name !== countryName);
    setPrimeTrafficCountries(newCountries);
    
    // Update formData
    handleFormChange({
      target: {
        name: 'primeTrafficCountries',
        value: newCountries.join(',')
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };
  
  // Function to handle category selection
  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  // Function to save selected categories
  const saveCategories = () => {
    // Store the actual category names instead of backend enum values
    if (selectedCategories.length > 0) {
      const selectedCategoryNames = selectedCategories
        .map(id => {
          const category = CATEGORIES.find(cat => cat.id === id);
          return category ? category.name : null;
        })
        .filter(Boolean) as string[]; // Filter out null values and cast to string[]
      
      // Join the category names with commas for storage
      handleFormChange({
        target: {
          name: 'category',
          value: selectedCategoryNames.join(',')
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
    
    setShowCategoryModal(false);
  };

  // Function to clear all selected categories
  const clearCategories = () => {
    setSelectedCategories([]);
    handleFormChange({
      target: {
        name: 'category',
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const [showSEOModal, setShowSEOModal] = useState(false);

  // Local submit handler: allow either title or url (title priority), require description
  const onLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const desc = (formData.description || '').trim();
    if (!desc) {
      window.alert('Description is required. Please add a description before submitting.');
      return;
    }

    if ((!formData.title || formData.title.trim() === '') && formData.url) {
      try {
        let host = formData.url;
        if (!/^https?:\/\//i.test(host)) {
          host = 'https://' + host;
        }
        const parsed = new URL(host);
        const derivedTitle = parsed.hostname.replace(/^www\./i, '');
        handleFormChange({ target: { name: 'title', value: derivedTitle } } as unknown as React.ChangeEvent<HTMLInputElement>);
      } catch (err) {
        // ignore
      }
    }

    setTimeout(() => handleSubmit(e), 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">
          {editingWebsite ? 'Edit Website' : 'Add New Website'}
        </h2>
        <div className="flex gap-2">
          {editingWebsite && (
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors duration-200"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={() => setUseMultiStepForm(true)}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors duration-200"
          >
            Use Multi-Step Form
          </button>
        </div>
      </div>
      
      <form onSubmit={onLocalSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
              Domain Name
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              placeholder="Enter domain name (preferred)"
            />
            <p className="mt-1 text-xs text-gray-500">You can provide either Domain Name or Website URL. Domain Name has priority and will be used if present.</p>
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-semibold text-gray-700">
              Website URL
            </label>
            <input
              type="text"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              placeholder="example.com or https://example.com or http://example.com"
            />
            <p className="mt-1 text-xs text-gray-500">If Domain Name is empty, Website URL will be used to derive the domain name.</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Category *
            </label>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left bg-white transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {selectedCategories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.slice(0, 3).map(id => {
                    const category = CATEGORIES.find(cat => cat.id === id);
                    return category ? (
                      <span key={id} className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full font-medium">
                        {category.name}
                      </span>
                    ) : null;
                  })}
                  {selectedCategories.length > 3 && (
                    <span className="text-gray-500 text-xs px-2 py-1.5">
                      + {selectedCategories.length - 3} more
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-gray-500">Select categories</span>
              )}
            </button>
            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={clearCategories}
                className="mt-1 text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear selection
              </button>
            )}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-gray-700">
              Price (USD) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleFormChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            rows={4}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            placeholder="Describe your website..."
          />
        </div>

        {/* SEO Metrics */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">SEO Metrics</h3>
            <button
              type="button"
              onClick={() => setShowSEOModal(true)}
              className="ml-3 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors duration-200"
              title="SEO Metrics Information"
            >
              <span className="material-symbols-outlined text-lg">info</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label htmlFor="DA" className="block text-sm font-semibold text-gray-700">
                DA *
              </label>
              <input
                type="number"
                id="DA"
                name="DA"
                value={formData.DA}
                onChange={handleFormChange}
                required
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="PA" className="block text-sm font-semibold text-gray-700">
                PA *
              </label>
              <input
                type="number"
                id="PA"
                name="PA"
                value={formData.PA}
                onChange={handleFormChange}
                required
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="DR" className="block text-sm font-semibold text-gray-700">
                DR *
              </label>
              <input
                type="number"
                id="DR"
                name="DR"
                value={formData.DR}
                onChange={handleFormChange}
                required
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="Spam" className="block text-sm font-semibold text-gray-700">
                Spam *
              </label>
              <input
                type="number"
                id="Spam"
                name="Spam"
                value={formData.Spam}
                onChange={handleFormChange}
                required
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="OrganicTraffic" className="block text-sm font-semibold text-gray-700">
                Organic Traffic *
              </label>
              <input
                type="number"
                id="OrganicTraffic"
                name="OrganicTraffic"
                value={formData.OrganicTraffic}
                onChange={handleFormChange}
                required
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="RD" className="block text-sm font-semibold text-gray-700">
                RD*
              </label>
              <input
                type="number"
                id="RD"
                name="RD"
                value={formData.RD ?? ''}
                onChange={handleFormChange}
                required
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traffic Value */}
          <div className="space-y-2">
            <label htmlFor="trafficValue" className="block text-sm font-semibold text-gray-700">
              Traffic Value (USD) *
            </label>
            <input
              type="number"
              id="trafficValue"
              name="trafficValue"
              value={formData.trafficValue || ''}
              onChange={handleFormChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              placeholder="0.00"
            />
          </div>

          {/* Location Traffic */}
          <div className="space-y-2">
            <label htmlFor="locationTraffic" className="block text-sm font-semibold text-gray-700">
              Location Traffic *
            </label>
            <input
              type="number"
              id="locationTraffic"
              name="locationTraffic"
              value={formData.locationTraffic || ''}
              onChange={handleFormChange}
              required
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              placeholder="0"
            />
          </div>

          {/* Grey Niche Accepted */}
          <div className="space-y-2">
            <label htmlFor="greyNicheAccepted" className="block text-sm font-semibold text-gray-700">
              Grey Niche Accepted? *
            </label>
            <select
              id="greyNicheAccepted"
              name="greyNicheAccepted"
              value={
                formData.greyNicheAccepted === true
                  ? 'true'
                  : formData.greyNicheAccepted === false
                  ? 'false'
                  : ''
              }
              onChange={handleFormChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none bg-white"
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Special Notes */}
          <div className="space-y-2">
            <label htmlFor="specialNotes" className="block text-sm font-semibold text-gray-700">
              Special Notes
            </label>
            <textarea
              id="specialNotes"
              name="specialNotes"
              value={formData.specialNotes || ''}
              onChange={handleFormChange}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              placeholder="Any special notes about your website"
            />
          </div>
        </div>

        {/* Prime Traffic Countries */}
        <div className="relative space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Prime Traffic Countries *
          </label>
          <div className="border border-gray-300 rounded-lg p-4 min-h-[50px] bg-white shadow-sm">
            {primeTrafficCountries.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {primeTrafficCountries.map((country, index) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm flex items-center font-medium">
                    <span>{country}</span>
                    <button
                      type="button"
                      onClick={() => removeCountry(country)}
                      className="ml-2 text-blue-600 hover:text-blue-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-500 text-sm">No countries selected</span>
            )}
          </div>
          
          <div className="mt-2 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowCountryDropdown(true)}
              onBlur={() => {
                // Delay hiding the dropdown to allow clicking on items
                setTimeout(() => setShowCountryDropdown(false), 150);
              }}
              placeholder="Search and select countries..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              
            />
            
            {showCountryDropdown && (
              <div 
                className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                onMouseDown={(e) => e.preventDefault()} // Prevents blur when clicking on dropdown
              >
                {loadingCountries ? (
                  <div className="px-4 py-3 text-gray-500">Loading countries...</div>
                ) : filteredCountries.length > 0 ? (
                  filteredCountries.map((country, index) => (
                    <div
                      key={index}
                      onClick={() => addCountry(country.name)}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center transition-colors duration-150"
                    >
                      {country.flag && (
                        <img 
                          src={country.flag} 
                          alt={country.name} 
                          className="w-6 h-4 mr-3 object-contain" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      <span>{country.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500">No countries found</div>
                )}
              </div>
            )}
          </div>
          
          <p className="mt-1 text-sm text-gray-500">
            Search and select the countries that generate the most traffic to your website
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setActiveTab('websites');
            }}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              formLoading ||
              selectedCategories.length === 0 ||
              primeTrafficCountries.length === 0 ||
              !(formData.description && formData.description.trim() !== '')
            }
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 font-medium transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            {formLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                {editingWebsite ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">
                  {editingWebsite ? 'save' : 'add'}
                </span>
                {editingWebsite ? 'Update Website' : 'Submit for Approval'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Select Categories</h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>
              <p className="text-gray-500 mt-2">Select one or more categories for your website</p>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6">
              <div className="mb-4">
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.filter(cat =>
                  cat.name.toLowerCase().includes(categorySearch.toLowerCase())
                ).map((category) => (
                  <div
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedCategories.includes(category.id)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mr-4 mt-0.5 ${
                        selectedCategories.includes(category.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedCategories.includes(category.id) && (
                          <span className="material-symbols-outlined text-white text-sm">check</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{category.id}. {category.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
              <div className="text-sm text-gray-500">
                {selectedCategories.length} category{selectedCategories.length !== 1 ? 's' : ''} selected
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCategories}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Save Categories
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Metrics Information Modal */}
      {showSEOModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">SEO Metrics Information</h3>
                <button
                  onClick={() => setShowSEOModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">DA Checker:</h4>
                  <a 
                    href="https://moz.com/domain-analysis" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all font-medium"
                  >
                    https://moz.com/domain-analysis
                  </a>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">DR Checker:</h4>
                  <a 
                    href="https://ahrefs.com/website-authority-checker" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all font-medium"
                  >
                    https://ahrefs.com/website-authority-checker
                  </a>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Organic Traffic Checker:</h4>
                  <a 
                    href="https://ahrefs.com/traffic-checker/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all font-medium"
                  >
                    https://ahrefs.com/traffic-checker/
                  </a>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setShowSEOModal(false)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
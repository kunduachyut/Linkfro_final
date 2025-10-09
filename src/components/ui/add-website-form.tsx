"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Define the categories
const CATEGORIES = [
  { id: 1, name: "Finance, Insurance & Investment" },
  { id: 2, name: "Crypto, Blockchain, Bitcoin & Digital Assets" },
  { id: 3, name: "Health, Wellness, Fitness & Personal Care" },
  { id: 4, name: "Software, SaaS, Technology & IT Solutions" },
  { id: 5, name: "Business, Marketing, PR & Communication" },
  { id: 6, name: "Travel, Tourism, Adventure & Hospitality" },
  { id: 7, name: "Law, Legal Services, Attorneys & Compliance" },
  { id: 8, name: "Automotive, Cars, Bikes & Electric Vehicles (EVs)" },
  { id: 9, name: "iGaming, Casino, Betting, Gambling & Adult Niches" },
  { id: 10, name: "Education, E-Learning, Training & Career Development" },
  { id: 11, name: "Real Estate, Property, Home Improvement & Garden" },
  { id: 12, name: "Food, Recipes, Cooking & Culinary Lifestyle" },
  { id: 13, name: "Sports, Fitness, Training & Active Lifestyle" },
  { id: 14, name: "Clothing, Fashion, Style & Apparel" },
  { id: 15, name: "Beauty, Cosmetics, Skincare & Personal Style" },
  { id: 16, name: "Parenting, Family, Kids & Childcare" },
  { id: 17, name: "Wedding, Events, Parties & Celebrations" },
  { id: 18, name: "Lifestyle, General Interest & Multi-Niche Blogs" },
  { id: 19, name: "Photography, Visual Arts & Creative Media" },
  { id: 20, name: "Hobbies, Leisure, Crafts & Entertainment" },
  { id: 21, name: "Women's Lifestyle, Fashion & Inspiration" },
  { id: 22, name: "Men's Lifestyle, Fashion & Grooming" },
  { id: 23, name: "Media, Publishing, Literature & Books" },
  { id: 24, name: "Music, Movies, Film & Entertainment" },
  { id: 25, name: "Gadgets, Electronics, Hardware & Consumer Tech" },
  { id: 26, name: "Social Media, Influencers & Digital Trends" },
  { id: 27, name: "News, Blogs, Magazines & Current Affairs" },
  { id: 28, name: "Promotional Products, Gifts & Corporate Merchandise" },
  { id: 29, name: "Catering, Food Services & Hospitality Industry" },
  { id: 30, name: "Animals, Pets, Wildlife & Veterinary Care" },
  { id: 31, name: "Construction, Architecture, Engineering & Building" },
  { id: 32, name: "Sustainability, Eco-Friendly & Green Living" },
  { id: 33, name: "Games, Toys, Kids & Children's Products" },
  { id: 34, name: "Private SEO Blog Networks (PSBN)" }
];

const steps = [
  { id: "basic", title: "Basic Information" },
  { id: "seo", title: "SEO Metrics" },
  { id: "traffic", title: "Traffic Details" },
];

interface FormData {
  // Step 1: Basic Information
  domainName: string;
  websiteUrl: string;
  orderAcceptedEmail?: string;
  category: string;
  price: string;
  description: string;
  
  // Step 2: SEO Metrics
  DA: string;
  PA: string;
  DR: string;
  spam: string;
  organicTraffic: string;
  rdLink: string;
  
  // Step 3: Traffic Details
  trafficValue: string;
  locationTraffic: string;
  greyNicheAccepted: string;
  specialNotes: string;
  primeTrafficCountries: string[];
  
  // Status field
  status?: "pending" | "approved" | "rejected";
}

// Lightweight cached hook for countries. Uses sessionStorage to survive page reloads
// and an in-memory singleton to avoid duplicate background fetches in the same session.
let inMemoryCache: { name: string; flag: string }[] | null = null;
let inFlight: Promise<{ name: string; flag: string }[]> | null = null;

function useCountries() {
  const [countries, setCountries] = useState<{ name: string; flag: string }[] | null>(() => {
    if (inMemoryCache) return inMemoryCache;
    try {
      const raw = sessionStorage.getItem('countries');
      if (raw) {
        const parsed = JSON.parse(raw) as { name: string; flag: string }[];
        inMemoryCache = parsed;
        return parsed;
      }
    } catch (e) {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    if (countries) return; // already have data

    // If there's an in-flight fetch, reuse it
    if (inFlight) {
      inFlight.then(data => setCountries(data)).catch(() => {});
      return;
    }

    inFlight = (async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
        const data = await res.json();
        const mapped: { name: string; flag: string }[] = data.map((c: any) => ({
          name: c?.name?.common || '',
          flag: c?.flags?.svg || c?.flags?.png || ''
        })).filter((c: { name: string }) => c.name);
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        inMemoryCache = mapped;
        try { sessionStorage.setItem('countries', JSON.stringify(mapped)); } catch (e) { /* ignore */ }
        setCountries(mapped);
        return mapped;
      } catch (err) {
        inMemoryCache = [];
        setCountries([]);
        return [];
      } finally {
        inFlight = null;
      }
    })();

    // no cleanup needed
  }, [countries]);

  return { countries: countries ?? [], loading: countries === null } as const;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export function AddWebsiteForm({ 
  editingWebsite = null,
  onSubmit,
  onCancel
}: {
  editingWebsite?: any | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState(''); // New state for category search
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false); // New state for confirmation modal
  const [submissionData, setSubmissionData] = useState<FormData | null>(null); // New state to store data for confirmation
  // Temporary storage for step data
  const [step1Data, setStep1Data] = useState({
    domainName: editingWebsite?.title || "",
    websiteUrl: editingWebsite?.url || "",
    orderAcceptedEmail: editingWebsite?.orderAcceptedEmail || "",
    // Ensure category is always a scalar string. If editingWebsite provides an array, join it.
    category: Array.isArray(editingWebsite?.category)
      ? editingWebsite.category.join(',')
      : (editingWebsite?.category || ""),
    price: editingWebsite?.priceCents ? (editingWebsite.priceCents / 100).toString() : "",
    description: editingWebsite?.description || "",
  });
  
  const [step2Data, setStep2Data] = useState({
    DA: editingWebsite?.DA?.toString() || "",
    PA: editingWebsite?.PA?.toString() || "",
    DR: editingWebsite?.DR?.toString() || "",
    spam: editingWebsite?.Spam?.toString() || "",
    organicTraffic: editingWebsite?.OrganicTraffic?.toString() || "",
    rdLink: editingWebsite?.RD?.toString() || "",
  });
  
  const [step3Data, setStep3Data] = useState({
    trafficValue: editingWebsite?.trafficValue?.toString() || "",
    locationTraffic: editingWebsite?.locationTraffic?.toString() || "",
    greyNicheAccepted: editingWebsite?.greyNicheAccepted?.toString() || "",
    specialNotes: editingWebsite?.specialNotes || "",
    primeTrafficCountries: Array.isArray(editingWebsite?.primeTrafficCountries) 
      ? editingWebsite.primeTrafficCountries 
      : typeof editingWebsite?.primeTrafficCountries === 'string'
        ? editingWebsite.primeTrafficCountries.split(',').map(country => country.trim()).filter(Boolean)
        : [],
  });
  
  // Validation states
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});
  
  // useCountries hook provides cached countries + loading flag
  const { countries: allCountries, loading: loadingCountries } = useCountries();
  
  // Filter countries based on search term
  const filteredCountries = allCountries.filter(country => 
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );
  
  // Update functions for each step
  const updateStep1Data = (field: keyof typeof step1Data, value: string) => {
    setStep1Data((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (step1Errors[field]) {
      setStep1Errors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Update functions for step 2 and step 3
  const updateStep2Data = (field: keyof typeof step2Data, value: string) => {
    setStep2Data((prev) => ({ ...prev, [field]: value }));
    if (step2Errors[field]) {
      setStep2Errors(prev => {
        const newErrors = { ...prev } as Record<string, string>;
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const updateStep3Data = (field: keyof typeof step3Data, value: string) => {
    setStep3Data((prev) => ({ ...prev, [field]: value }));
    if (step3Errors[field]) {
      setStep3Errors(prev => {
        const newErrors = { ...prev } as Record<string, string>;
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  // Countries helpers used by the UI
  const addCountry = (country: string) => {
    if (!country) return;
    setStep3Data(prev => {
      const list = Array.isArray(prev.primeTrafficCountries) ? [...prev.primeTrafficCountries] : [];
      if (!list.includes(country)) list.push(country);
      return { ...prev, primeTrafficCountries: list };
    });
  };

  const removeCountry = (index: number) => {
    setStep3Data(prev => {
      const list = Array.isArray(prev.primeTrafficCountries) ? [...prev.primeTrafficCountries] : [];
      list.splice(index, 1);
      return { ...prev, primeTrafficCountries: list };
    });
  };

  const handleAddCountry = () => {
    const candidate = searchTerm.trim();
    if (!candidate) return;
    addCountry(candidate);
    setSearchTerm('');
    setCountrySearchTerm('');
    setShowCountryDropdown(false);
  };

  // Validate step 1 (basic info)
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!step1Data.domainName || !step1Data.domainName.trim()) {
      errors.domainName = 'Domain name is required';
    }
    if (!step1Data.price || isNaN(Number(step1Data.price)) || Number(step1Data.price) < 0) {
      errors.price = 'Price is required and must be a positive number';
    }
    if (!step1Data.category || !step1Data.category.trim()) {
      errors.category = 'Category is required';
    }
    // websiteUrl and description are optional per requirements
    // orderAcceptedEmail is optional but if provided must be a valid email
    if (step1Data.orderAcceptedEmail && step1Data.orderAcceptedEmail.trim()) {
      const email = step1Data.orderAcceptedEmail.trim();
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        errors.orderAcceptedEmail = 'Please enter a valid email address';
      }
    }
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleCountryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      handleAddCountry();
    }
  };
  
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const validateStep2 = () => {
    const errors: Record<string, string> = {};

    // DA is required
    if (!step2Data.DA) {
      errors.DA = "DA is required";
    } else if (isNaN(Number(step2Data.DA)) || Number(step2Data.DA) < 0 || Number(step2Data.DA) > 100) {
      errors.DA = "DA must be between 0 and 100";
    }

    // PA is optional; validate only when provided
    if (step2Data.PA) {
      if (isNaN(Number(step2Data.PA)) || Number(step2Data.PA) < 0 || Number(step2Data.PA) > 100) {
        errors.PA = "PA must be between 0 and 100";
      }
    }

    // DR is required
    if (!step2Data.DR) {
      errors.DR = "DR is required";
    } else if (isNaN(Number(step2Data.DR)) || Number(step2Data.DR) < 0 || Number(step2Data.DR) > 100) {
      errors.DR = "DR must be between 0 and 100";
    }

    // Spam is required
    if (!step2Data.spam) {
      errors.spam = "Spam score is required";
    } else if (isNaN(Number(step2Data.spam)) || Number(step2Data.spam) < 0 || Number(step2Data.spam) > 100) {
      errors.spam = "Spam score must be between 0 and 100";
    }

    // Organic traffic is required
    if (!step2Data.organicTraffic) {
      errors.organicTraffic = "Organic traffic is required";
    } else if (isNaN(Number(step2Data.organicTraffic)) || Number(step2Data.organicTraffic) < 0) {
      errors.organicTraffic = "Organic traffic must be a positive number";
    }

    // Referring domains (rdLink) are optional; if provided, validate as a positive number
    if (step2Data.rdLink) {
      if (isNaN(Number(step2Data.rdLink)) || Number(step2Data.rdLink) < 0) {
        errors.rdLink = "RD link must be a positive number";
      }
    }

    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    
    if (!step3Data.trafficValue) {
      errors.trafficValue = "Traffic value is required";
    } else if (isNaN(Number(step3Data.trafficValue)) || Number(step3Data.trafficValue) < 0) {
      errors.trafficValue = "Traffic value must be a positive number";
    }
    
    if (!step3Data.locationTraffic) {
      errors.locationTraffic = "Location traffic is required";
    } else if (isNaN(Number(step3Data.locationTraffic)) || Number(step3Data.locationTraffic) < 0) {
      errors.locationTraffic = "Location traffic must be a positive number";
    }
    
    if (!step3Data.greyNicheAccepted) {
      errors.greyNicheAccepted = "Please select an option";
    }
    
    // Check if primeTrafficCountries is empty or not properly initialized
    if (!step3Data.primeTrafficCountries || step3Data.primeTrafficCountries.length === 0) {
      errors.primeTrafficCountries = "At least one country is required";
    }
    
    setStep3Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    let isValid = true;
    
    if (currentStep === 0) {
      isValid = validateStep1();
    } else if (currentStep === 1) {
      isValid = validateStep2();
    }
    
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submission
    const isStep1Valid = validateStep1();
    const isStep2Valid = validateStep2();
    const isStep3Valid = validateStep3();
    
    if (isStep1Valid && isStep2Valid && isStep3Valid) {
      // Combine all step data for final submission
      const combinedData: FormData = {
        ...step1Data,
        ...step2Data,
        ...step3Data,
      };
      
      // Ensure all required fields are present
      const finalSubmissionData: FormData = {
        domainName: combinedData.domainName,
        // If the user provided an email in the 'orderAcceptedEmail' field, store that into the DB's `websiteUrl` field
        // (per requirement: the single email field should be saved into the url field). Otherwise fallback to websiteUrl or domainName
        websiteUrl: (combinedData.orderAcceptedEmail && combinedData.orderAcceptedEmail.trim())
          ? combinedData.orderAcceptedEmail.trim()
          : (combinedData.websiteUrl && combinedData.websiteUrl.trim() ? combinedData.websiteUrl : combinedData.domainName),
        // Keep the explicit email field as well (optional) so it's available to the backend if needed
        orderAcceptedEmail: combinedData.orderAcceptedEmail?.trim ? combinedData.orderAcceptedEmail.trim() : combinedData.orderAcceptedEmail,
        category: combinedData.category,
        price: combinedData.price,
        description: combinedData.description,
        DA: combinedData.DA,
        PA: combinedData.PA,
        DR: combinedData.DR,
        spam: combinedData.spam,
        organicTraffic: combinedData.organicTraffic,
        rdLink: combinedData.rdLink,
        trafficValue: combinedData.trafficValue,
        locationTraffic: combinedData.locationTraffic,
        greyNicheAccepted: combinedData.greyNicheAccepted,
        specialNotes: combinedData.specialNotes,
        primeTrafficCountries: combinedData.primeTrafficCountries,
        // Add status field to ensure it goes to pending state
        status: "pending"
      };
      
      // Show confirmation modal instead of directly submitting
      setSubmissionData(finalSubmissionData);
      setShowConfirmation(true);
    }
  };

  const handleFinalSubmit = async () => {
    if (!submissionData) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(submissionData);
      toast.success(editingWebsite ? "Website updated successfully!" : "Website submitted successfully!");
      setShowConfirmation(false);
    } catch (error) {
      toast.error("Failed to submit website. Please try again.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* Progress indicator */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full cursor-pointer transition-colors duration-300 flex items-center justify-center border-2",
                  index < currentStep
                    ? "bg-primary text-white border-primary"
                    : index === currentStep
                      ? "bg-primary text-white border-primary ring-4 ring-primary/20"
                      : "bg-white text-muted-foreground border-muted-foreground",
                )}
                onClick={() => {
                  // Only allow going back or to completed steps
                  if (index <= currentStep) {
                    setCurrentStep(index);
                  }
                }}
                whileTap={{ scale: 0.95 }}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </motion.div>
              <motion.span
                className={cn(
                  "text-xs mt-2 text-center font-medium",
                  index === currentStep
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {step.title}
              </motion.span>
            </motion.div>
          ))}
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-4">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border shadow-lg rounded-xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Basic Information */}
              {currentStep === 0 && (
                <>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">Basic Information</CardTitle>
                    <CardDescription>
                      Enter the basic details of your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="domainName">Domain Name *</Label>
                      <Input
                        id="domainName"
                        placeholder="example.com"
                        value={step1Data.domainName}
                        onChange={(e) => updateStep1Data("domainName", e.target.value)}
                        className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 ${step1Errors.domainName ? "border-red-500" : ""}`}
                      />
                      {step1Errors.domainName && (
                        <p className="text-sm text-red-500">{step1Errors.domainName}</p>
                      )}
                    </motion.div>
                    
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="orderAcceptedEmail">Order accepted e-mail</Label>
                      <Input
                        id="orderAcceptedEmail"
                        placeholder="example@email.com"
                        value={step1Data.orderAcceptedEmail}
                        onChange={(e) => updateStep1Data("orderAcceptedEmail", e.target.value)}
                        className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 ${step1Errors.orderAcceptedEmail ? "border-red-500" : ""}`}
                      />
                      {step1Errors.orderAcceptedEmail && (
                        <p className="text-sm text-red-500">{step1Errors.orderAcceptedEmail}</p>
                      )}
                    </motion.div>
                    
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <div className="relative">
                        <Select 
                          value={step1Data.category} 
                          onValueChange={(value) => updateStep1Data("category", value)}
                        >
                          <SelectTrigger className={`h-12 ${step1Errors.category ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <div className="p-2 border-b">
                              <input
                                type="text"
                                placeholder="Search categories..."
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={categorySearchTerm}
                                onChange={(e) => setCategorySearchTerm(e.target.value)}
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {CATEGORIES.filter(cat => 
                                cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
                              ).map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                      {step1Errors.category && (
                        <p className="text-sm text-red-500">{step1Errors.category}</p>
                      )}
                    </motion.div>
                    
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="price">Price (USD) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={step1Data.price}
                        onChange={(e) => updateStep1Data("price", e.target.value)}
                        className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 ${step1Errors.price ? "border-red-500" : ""}`}
                      />
                      {step1Errors.price && (
                        <p className="text-sm text-red-500">{step1Errors.price}</p>
                      )}
                    </motion.div>
                    
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your website..."
                        value={step1Data.description}
                        onChange={(e) => updateStep1Data("description", e.target.value)}
                        className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${step1Errors.description ? "border-red-500" : ""}`}
                        rows={4}
                      />
                      {step1Errors.description && (
                        <p className="text-sm text-red-500">{step1Errors.description}</p>
                      )}
                    </motion.div>
                  </CardContent>
                </>
              )}

              {/* Step 2: SEO Metrics */}
              {currentStep === 1 && (
                <>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">SEO Metrics</CardTitle>
                    <CardDescription>
                      Enter the SEO metrics for your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="DA">DA *</Label>
                        <Input
                          id="DA"
                          type="number"
                          placeholder="0-100"
                          value={step2Data.DA}
                          onChange={(e) => updateStep2Data("DA", e.target.value)}
                          min="0"
                          max="100"
                          className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 ${step2Errors.DA ? "border-red-500" : ""}`}
                        />
                        {step2Errors.DA && (
                          <p className="text-sm text-red-500">{step2Errors.DA}</p>
                        )}
                      </motion.div>
                      
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="PA">PA</Label>
                        <Input
                          id="PA"
                          type="number"
                          placeholder="0-100"
                          value={step2Data.PA}
                          onChange={(e) => updateStep2Data("PA", e.target.value)}
                          min="0"
                          max="100"
                          className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 ${step2Errors.PA ? "border-red-500" : ""}`}
                        />
                        {step2Errors.PA && (
                          <p className="text-sm text-red-500">{step2Errors.PA}</p>
                        )}
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="DR">DR *</Label>
                        <Input
                          id="DR"
                          type="number"
                          placeholder="0-100"
                          value={step2Data.DR}
                          onChange={(e) => updateStep2Data("DR", e.target.value)}
                          min="0"
                          max="100"
                          className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 ${step2Errors.DR ? "border-red-500" : ""}`}
                        />
                        {step2Errors.DR && (
                          <p className="text-sm text-red-500">{step2Errors.DR}</p>
                        )}
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="spam">Spam *</Label>
                        <Input
                          id="spam"
                          type="number"
                          placeholder="0-100"
                          value={step2Data.spam}
                          onChange={(e) => updateStep2Data("spam", e.target.value)}
                          min="0"
                          max="100"
                          className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 ${step2Errors.spam ? "border-red-500" : ""}`}
                        />
                        {step2Errors.spam && (
                          <p className="text-sm text-red-500">{step2Errors.spam}</p>
                        )}
                      </motion.div>
                      
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="organicTraffic">Organic Traffic *</Label>
                        <Input
                          id="organicTraffic"
                          type="number"
                          placeholder="0"
                          value={step2Data.organicTraffic}
                          onChange={(e) => updateStep2Data("organicTraffic", e.target.value)}
                          min="0"
                          className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 ${step2Errors.organicTraffic ? "border-red-500" : ""}`}
                        />
                        {step2Errors.organicTraffic && (
                          <p className="text-sm text-red-500">{step2Errors.organicTraffic}</p>
                        )}
                      </motion.div>
                      
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="rdLink">Referring Domain</Label>
                        <Input
                          id="rdLink"
                          type="number"
                          placeholder="0"
                          value={step2Data.rdLink}
                          onChange={(e) => updateStep2Data("rdLink", e.target.value)}
                          min="0"
                          step="1"
                          className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 ${step2Errors.rdLink ? "border-red-500" : ""}`}
                        />
                        {step2Errors.rdLink && (
                          <p className="text-sm text-red-500">{step2Errors.rdLink}</p>
                        )}
                      </motion.div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 3: Traffic Details */}
              {currentStep === 2 && (
                <>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">Traffic Details</CardTitle>
                    <CardDescription>
                      Enter traffic-related information for your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="trafficValue">Traffic Value (USD) *</Label>
                      <Input
                        id="trafficValue"
                        type="number"
                        placeholder="0.00"
                        value={step3Data.trafficValue}
                        onChange={(e) => updateStep3Data("trafficValue", e.target.value)}
                        min="0"
                        step="0.01"
                        className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 ${step3Errors.trafficValue ? "border-red-500" : ""}`}
                      />
                      {step3Errors.trafficValue && (
                        <p className="text-sm text-red-500">{step3Errors.trafficValue}</p>
                      )}
                    </motion.div>
                    
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="locationTraffic">Location Traffic *</Label>
                      <Input
                        id="locationTraffic"
                        type="number"
                        placeholder="0"
                        value={step3Data.locationTraffic}
                        onChange={(e) => updateStep3Data("locationTraffic", e.target.value)}
                        min="0"
                        className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 ${step3Errors.locationTraffic ? "border-red-500" : ""}`}
                      />
                      {step3Errors.locationTraffic && (
                        <p className="text-sm text-red-500">{step3Errors.locationTraffic}</p>
                      )}
                    </motion.div>
                    
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="greyNicheAccepted">Grey Niche Accepted? *</Label>
                      <Select 
                        value={step3Data.greyNicheAccepted} 
                        onValueChange={(value) => updateStep3Data("greyNicheAccepted", value)}
                      >
                        <SelectTrigger className={`h-12 ${step3Errors.greyNicheAccepted ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                      {step3Errors.greyNicheAccepted && (
                        <p className="text-sm text-red-500">{step3Errors.greyNicheAccepted}</p>
                      )}
                    </motion.div>
                    
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="specialNotes">Special Notes</Label>
                      <Textarea
                        id="specialNotes"
                        placeholder="Any special notes about your website"
                        value={step3Data.specialNotes}
                        onChange={(e) => updateStep3Data("specialNotes", e.target.value)}
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        rows={3}
                      />
                    </motion.div>
                    
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="primeTrafficCountries">Prime Traffic Countries *</Label>
                      <div className="space-y-2">
                        {/* Selected Countries Display */}
                        <div className={`border rounded-lg p-4 min-h-[50px] bg-white shadow-sm ${step3Errors.primeTrafficCountries ? "border-red-500" : "border-gray-300"}`}>
                          {step3Data.primeTrafficCountries.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {step3Data.primeTrafficCountries.map((country, index) => {
                                // Find the country object to get the flag
                                const countryObj = allCountries.find(c => c.name === country);
                                return (
                                  <div key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm flex items-center font-medium">
                                    {countryObj?.flag && (
                                      <img 
                                        src={countryObj.flag} 
                                        alt={countryObj.name} 
                                        className="w-4 h-3 mr-2 object-contain" 
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <span>{country}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        removeCountry(index);
                                      }}
                                      className="ml-2 text-blue-600 hover:text-blue-900 font-bold"
                                    >
                                      ×
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">No countries selected</span>
                          )}
                        </div>
                        
                        {/* Add Country Input with Dropdown */}
                        <div className="mt-2 relative">
                          <Input
                            id="primeTrafficCountries"
                            placeholder="Search and select countries..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setCountrySearchTerm(e.target.value); // Sync with dropdown search
                              setShowCountryDropdown(true); // Show dropdown when typing
                            }}
                            onKeyDown={handleCountryKeyDown}
                            onFocus={() => setShowCountryDropdown(true)}
                            onBlur={() => {
                              // Delay hiding the dropdown to allow clicking on items
                              setTimeout(() => setShowCountryDropdown(false), 150);
                            }}
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12"
                          />
                          
                          {showCountryDropdown && (
                            <div 
                              className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                              onMouseDown={(e) => e.preventDefault()} // Prevents blur when clicking on dropdown
                            >
                              <div>
                                {loadingCountries ? (
                                  <div className="px-4 py-3 text-gray-500 flex items-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Loading countries...
                                  </div>
                                ) : filteredCountries.length > 0 ? (
                                  filteredCountries.map((country, index) => (
                                    <div
                                      key={`${country.name}-${index}`}
                                      onClick={() => {
                                        addCountry(country.name);
                                        setSearchTerm('');
                                        setCountrySearchTerm('');
                                        setShowCountryDropdown(false);
                                      }}
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
                            </div>
                          )}
                        </div>
                        
                        {step3Errors.primeTrafficCountries && (
                          <p className="text-sm text-red-500">{step3Errors.primeTrafficCountries}</p>
                        )}
                        
                        <p className="text-sm text-gray-500">
                          Search and select the countries that generate the most traffic to your website
                        </p>
                      </div>
                    </motion.div>
                  </CardContent>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <CardFooter className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onCancel : prevStep}
              disabled={isSubmitting}
              className="h-11"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {currentStep === 0 ? "Cancel" : "Previous"}
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={nextStep} 
                className="h-11"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                disabled={isSubmitting}
                className="h-11"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingWebsite ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {editingWebsite ? "Update Website" : "Submit Website"}
                  </>
                )}
              </Button>

            )}
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && submissionData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    Confirm Website Submission
                  </h3>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mt-1">
                  Please review your website details before submitting
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Domain Name</p>
                        <p className="font-medium">{submissionData.domainName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Website URL</p>
                        <p className="font-medium">{submissionData.websiteUrl}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{submissionData.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium">${submissionData.price}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700">{submissionData.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">SEO Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">DA:</span>
                        <span className="font-medium">{submissionData.DA}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PA:</span>
                        <span className="font-medium">{submissionData.PA}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">DR:</span>
                        <span className="font-medium">{submissionData.DR}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spam:</span>
                        <span className="font-medium">{submissionData.spam}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Organic Traffic:</span>
                        <span className="font-medium">{submissionData.organicTraffic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">RD Link:</span>
                        <span className="font-medium">{submissionData.rdLink}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Traffic Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Traffic Value:</span>
                        <span className="font-medium">${submissionData.trafficValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location Traffic:</span>
                        <span className="font-medium">{submissionData.locationTraffic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Grey Niche Accepted:</span>
                        <span className="font-medium">
                          {submissionData.greyNicheAccepted === "true" ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {submissionData.specialNotes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Special Notes</h4>
                    <p className="text-gray-700">{submissionData.specialNotes}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Prime Traffic Countries</h4>
                  <div className="flex flex-wrap gap-2">
                    {submissionData.primeTrafficCountries.map((country, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Submission
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
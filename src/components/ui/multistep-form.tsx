"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Define the form data structure to match the existing website form
interface FormData {
  title: string;
  url: string;
  description: string;
  category: string;
  price: string;
  DA: string;
  PA: string;
  Spam: string;
  OrganicTraffic: string;
  DR: string;
  RD: string;
  trafficValue: string;
  locationTraffic: string;
  greyNicheAccepted: string;
  specialNotes: string;
  primeTrafficCountries: string;
  name: string;
  email: string;
  company: string;
  profession: string;
  experience: string;
  industry: string;
  primaryGoal: string;
  targetAudience: string;
  contentTypes: string[];
  colorPreference: string;
  stylePreference: string;
  inspirations: string;
  budget: string;
  timeline: string;
  features: string[];
  additionalInfo: string;
}

// Define the categories as in the original form
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
  { id: "website", title: "Website Info" },
  { id: "seo", title: "SEO Metrics" },
  { id: "traffic", title: "Traffic Details" },
  { id: "personal", title: "Personal Info" },
  { id: "professional", title: "Professional" },
  { id: "goals", title: "Website Goals" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

// Props interface for the form
interface OnboardingFormProps {
  initialData?: Partial<FormData>;
  onSubmit?: (data: FormData) => void;
  onCancel?: () => void;
}

const OnboardingForm = ({ initialData, onSubmit, onCancel }: OnboardingFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    url: "",
    description: "",
    category: "",
    price: "",
    DA: "",
    PA: "",
    Spam: "",
    OrganicTraffic: "",
    DR: "",
    RD: "",
    trafficValue: "",
    locationTraffic: "",
    greyNicheAccepted: "",
    specialNotes: "",
    primeTrafficCountries: "",
    name: "",
    email: "",
    company: "",
    profession: "",
    experience: "",
    industry: "",
    primaryGoal: "",
    targetAudience: "",
    contentTypes: [],
    colorPreference: "",
    stylePreference: "",
    inspirations: "",
    budget: "",
    timeline: "",
    features: [],
    additionalInfo: "",
    ...initialData
  });

  // Helper to ensure a value passed to Select is a scalar string (Radix Select expects string values for non-multiple selects)
  const asScalar = (v: any) => {
    if (v == null) return "";
    if (Array.isArray(v)) return v.join(",");
    return String(v);
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => {
      const features = [...prev.features];
      if (features.includes(feature)) {
        return { ...prev, features: features.filter((f) => f !== feature) };
      } else {
        return { ...prev, features: [...features, feature] };
      }
    });
  };

  const toggleContentType = (type: string) => {
    setFormData((prev) => {
      const types = [...prev.contentTypes];
      if (types.includes(type)) {
        return { ...prev, contentTypes: types.filter((t) => t !== type) };
      } else {
        return { ...prev, contentTypes: [...types, type] };
      }
    });
  };

  const addCountry = (country: string) => {
    const countries = formData.primeTrafficCountries 
      ? formData.primeTrafficCountries.split(',').map(c => c.trim()) 
      : [];
    
    if (!countries.includes(country)) {
      const newCountries = [...countries, country];
      updateFormData('primeTrafficCountries', newCountries.join(', '));
    }
  };

  const removeCountry = (country: string) => {
    const countries = formData.primeTrafficCountries 
      ? formData.primeTrafficCountries.split(',').map(c => c.trim()).filter(c => c !== country)
      : [];
    
    updateFormData('primeTrafficCountries', countries.join(', '));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Call the onSubmit handler if provided
    if (onSubmit) {
      onSubmit(formData);
    } else {
      // Simulate API call
      setTimeout(() => {
        toast.success("Website submitted successfully!");
        setIsSubmitting(false);
      }, 1500);
    }
  };

  // Check if step is valid for next button
  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Website Info
        return formData.title.trim() !== "" && formData.url.trim() !== "" && formData.category !== "";
      case 1: // SEO Metrics
        return formData.DA !== "" && formData.PA !== "" && formData.DR !== "" && 
               formData.Spam !== "" && formData.OrganicTraffic !== "" && formData.RD !== "";
      case 2: // Traffic Details
        return formData.trafficValue !== "" && formData.locationTraffic !== "" && 
               formData.greyNicheAccepted !== "" && formData.primeTrafficCountries !== "";
      case 3: // Personal Info
        return formData.name.trim() !== "" && formData.email.trim() !== "";
      case 4: // Professional
        return formData.profession.trim() !== "" && formData.industry !== "";
      case 5: // Website Goals
        return true; // All fields in this step are optional
      default:
        return true;
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
                  "w-4 h-4 rounded-full cursor-pointer transition-colors duration-300",
                  index < currentStep
                    ? "bg-primary"
                    : index === currentStep
                      ? "bg-primary ring-4 ring-primary/20"
                      : "bg-muted",
                )}
                onClick={() => {
                  // Only allow going back or to completed steps
                  if (index <= currentStep) {
                    setCurrentStep(index);
                  }
                }}
                whileTap={{ scale: 0.95 }}
              />
              <motion.span
                className={cn(
                  "text-xs mt-1.5 hidden sm:block",
                  index === currentStep
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                )}
              >
                {step.title}
              </motion.span>
            </motion.div>
          ))}
        </div>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border shadow-md rounded-3xl overflow-hidden">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentVariants}
              >
                {/* Step 1: Website Info */}
                {currentStep === 0 && (
                  <>
                    <CardHeader>
                      <CardTitle>Website Information</CardTitle>
                      <CardDescription>
                        Tell us about your website
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="title">Domain Name *</Label>
                        <Input
                          id="title"
                          placeholder="example.com"
                          value={formData.title}
                          onChange={(e) =>
                            updateFormData("title", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="url">Website URL *</Label>
                        <Input
                          id="url"
                          placeholder="https://example.com"
                          value={formData.url}
                          onChange={(e) =>
                            updateFormData("url", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={asScalar(formData.category)}
                            onValueChange={(value) =>
                              updateFormData("category", value)
                            }
                          >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="price">Price (USD) *</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) =>
                            updateFormData("price", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your website..."
                          value={formData.description}
                          onChange={(e) =>
                            updateFormData("description", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 2: SEO Metrics */}
                {currentStep === 1 && (
                  <>
                    <CardHeader>
                      <CardTitle>SEO Metrics</CardTitle>
                      <CardDescription>
                        Provide your website's SEO metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="DA">DA *</Label>
                          <Input
                            id="DA"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={formData.DA}
                            onChange={(e) =>
                              updateFormData("DA", e.target.value)
                            }
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="PA">PA *</Label>
                          <Input
                            id="PA"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={formData.PA}
                            onChange={(e) =>
                              updateFormData("PA", e.target.value)
                            }
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="DR">DR *</Label>
                          <Input
                            id="DR"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={formData.DR}
                            onChange={(e) =>
                              updateFormData("DR", e.target.value)
                            }
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="Spam">Spam *</Label>
                          <Input
                            id="Spam"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={formData.Spam}
                            onChange={(e) =>
                              updateFormData("Spam", e.target.value)
                            }
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="OrganicTraffic">Organic Traffic *</Label>
                          <Input
                            id="OrganicTraffic"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={formData.OrganicTraffic}
                            onChange={(e) =>
                              updateFormData("OrganicTraffic", e.target.value)
                            }
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="RD">RD *</Label>
                          <Input
                            id="RD"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={formData.RD}
                            onChange={(e) =>
                              updateFormData("RD", e.target.value)
                            }
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </motion.div>
                      </div>
                    </CardContent>
                  </>
                )}

                {/* Step 3: Traffic Details */}
                {currentStep === 2 && (
                  <>
                    <CardHeader>
                      <CardTitle>Traffic Details</CardTitle>
                      <CardDescription>
                        Information about your website traffic
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="trafficValue">Traffic Value (USD) *</Label>
                        <Input
                          id="trafficValue"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.trafficValue}
                          onChange={(e) =>
                            updateFormData("trafficValue", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="locationTraffic">Location Traffic *</Label>
                        <Input
                          id="locationTraffic"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={formData.locationTraffic}
                          onChange={(e) =>
                            updateFormData("locationTraffic", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="greyNicheAccepted">Grey Niche Accepted? *</Label>
                        <Select
                            value={asScalar(formData.greyNicheAccepted)}
                            onValueChange={(value) =>
                              updateFormData("greyNicheAccepted", value)
                            }
                          >
                          <SelectTrigger id="greyNicheAccepted">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="primeTrafficCountries">Prime Traffic Countries *</Label>
                        <Input
                          id="primeTrafficCountries"
                          placeholder="Enter countries separated by commas"
                          value={formData.primeTrafficCountries}
                          onChange={(e) =>
                            updateFormData("primeTrafficCountries", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="specialNotes">Special Notes</Label>
                        <Textarea
                          id="specialNotes"
                          placeholder="Any special notes about your website..."
                          value={formData.specialNotes}
                          onChange={(e) =>
                            updateFormData("specialNotes", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 4: Personal Info */}
                {currentStep === 3 && (
                  <>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Tell us about yourself
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) =>
                            updateFormData("name", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            updateFormData("email", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="company">
                          Company/Organization (Optional)
                        </Label>
                        <Input
                          id="company"
                          placeholder="Your Company"
                          value={formData.company}
                          onChange={(e) =>
                            updateFormData("company", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 5: Professional Background */}
                {currentStep === 4 && (
                  <>
                    <CardHeader>
                      <CardTitle>Professional Background</CardTitle>
                      <CardDescription>
                        Tell us about your professional experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="profession">
                          What&apos;s your profession?
                        </Label>
                        <Input
                          id="profession"
                          placeholder="e.g. Designer, Developer, Marketer"
                          value={formData.profession}
                          onChange={(e) =>
                            updateFormData("profession", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="industry">
                          What industry do you work in?
                        </Label>
                        <Select
                          value={asScalar(formData.industry)}
                          onValueChange={(value) =>
                            updateFormData("industry", value)
                          }
                        >
                          <SelectTrigger id="industry">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">
                              Technology
                            </SelectItem>
                            <SelectItem value="healthcare">
                              Healthcare
                            </SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="education">
                              Education
                            </SelectItem>
                            <SelectItem value="ecommerce">
                              E-commerce
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="experience">
                          Years of experience in your field
                        </Label>
                        <Select
                          value={asScalar(formData.experience)}
                          onValueChange={(value) =>
                            updateFormData("experience", value)
                          }
                        >
                          <SelectTrigger id="experience">
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">0-1 years</SelectItem>
                            <SelectItem value="2-5">2-5 years</SelectItem>
                            <SelectItem value="6-10">6-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 6: Website Goals */}
                {currentStep === 5 && (
                  <>
                    <CardHeader>
                      <CardTitle>Website Goals</CardTitle>
                      <CardDescription>
                        What do you want to achieve with your website?
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label>What is your primary goal?</Label>
                        <RadioGroup
                          value={formData.primaryGoal}
                          onValueChange={(value) =>
                            updateFormData("primaryGoal", value)
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="increase-sales"
                              id="increase-sales"
                            />
                            <Label htmlFor="increase-sales">
                              Increase sales
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="generate-leads"
                              id="generate-leads"
                            />
                            <Label htmlFor="generate-leads">
                              Generate leads
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="build-brand"
                              id="build-brand"
                            />
                            <Label htmlFor="build-brand">
                              Build brand awareness
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="provide-info"
                              id="provide-info"
                            />
                            <Label htmlFor="provide-info">
                              Provide information
                            </Label>
                          </div>
                        </RadioGroup>
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="targetAudience">
                          Who is your target audience?
                        </Label>
                        <Textarea
                          id="targetAudience"
                          placeholder="Describe your ideal customers..."
                          value={formData.targetAudience}
                          onChange={(e) =>
                            updateFormData("targetAudience", e.target.value)
                          }
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label>What type of content will you have?</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Blog posts",
                            "Product pages",
                            "Videos",
                            "Images",
                            "Podcasts",
                            "Newsletters",
                          ].map((type) => (
                            <div
                              key={type}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={type.toLowerCase().replace(/\s+/g, "-")}
                                checked={formData.contentTypes.includes(type)}
                                onCheckedChange={() =>
                                  toggleContentType(type)
                                }
                              />
                              <Label
                                htmlFor={type.toLowerCase().replace(/\s+/g, "-")}
                              >
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </CardContent>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex items-center gap-2"
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            </div>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Submit Website
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export { OnboardingForm };
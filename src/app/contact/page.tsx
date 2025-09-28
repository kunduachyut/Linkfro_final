"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin, Clock, User, Building, MessageSquare } from "lucide-react";

const Contact = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));
    
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      description: "Get in touch with our team",
      detail: "support@linkfro.com",
      action: "mailto:support@linkfro.com"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      description: "Speak with a representative",
      detail: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      description: "Our headquarters",
      detail: "123 Market Street, San Francisco, CA 94103",
      action: "#"
    }
  ];

  const officeHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 blur-3xl"></div>
        <div className="container px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="pulse-chip mx-auto mb-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.1s" }}>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">
                <MessageSquare className="w-3 h-3" />
              </span>
              <span>Contact Us</span>
            </div>
            
            <h1 className="section-title mb-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.3s" }}>
              Get in Touch with Linkfro
            </h1>
            
            <p className="section-subtitle mx-auto mb-8 opacity-0 animate-on-scroll" style={{ animationDelay: "0.5s" }}>
              We're here to help you connect advertisers with publishers. Reach out to us through any of the channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods Section */}
      <section className="py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div
                key={method.title}
                className={cn(
                  "glass-card p-6 text-center hover-lift opacity-0 animate-on-scroll",
                  "group transition-all duration-300"
                )}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-pulse-500 text-white flex items-center justify-center mx-auto mb-4">
                  {method.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-3">{method.description}</p>
                <a 
                  href={method.action} 
                  className="text-pulse-500 font-medium hover:underline"
                >
                  {method.detail}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="glass-card p-8 opacity-0 animate-on-scroll" style={{ animationDelay: "0.2s" }}>
              <h2 className="section-title mb-6">Send us a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="firstName"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="lastName"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="company"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                      placeholder="Your Company"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="message"
                      rows={4}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pulse-500 to-pulse-600 text-white py-3 px-6 rounded-lg font-medium hover:from-pulse-600 hover:to-pulse-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                >
                  Send Message
                </button>
              </form>
            </div>
            
            {/* Office Info */}
            <div>
              <div className="glass-card p-8 mb-8 opacity-0 animate-on-scroll" style={{ animationDelay: "0.4s" }}>
                <h2 className="section-title mb-6">Office Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pulse-100 text-pulse-500 flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Address</h3>
                      <p className="text-gray-600">
                        123 Market Street<br />
                        San Francisco, CA 94103<br />
                        United States
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pulse-100 text-pulse-500 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Office Hours</h3>
                      <div className="space-y-2">
                        {officeHours.map((item, index) => (
                          <div key={index} className="flex justify-between text-gray-600">
                            <span>{item.day}</span>
                            <span>{item.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pulse-100 text-pulse-500 flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Phone</h3>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-8 opacity-0 animate-on-scroll" style={{ animationDelay: "0.6s" }}>
                <h3 className="text-xl font-semibold mb-4">Need Immediate Help?</h3>
                <p className="text-gray-600 mb-4">
                  For urgent inquiries, you can reach our support team 24/7 through our emergency contact line.
                </p>
                <a 
                  href="tel:+15559998888" 
                  className="inline-flex items-center text-pulse-500 font-medium hover:underline"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  +1 (555) 999-8888
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="pulse-chip mx-auto mb-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.1s" }}>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">
                ?
              </span>
              <span>Frequently Asked Questions</span>
            </div>
            
            <h2 className="section-title mb-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.3s" }}>
              Common Questions
            </h2>
            
            <p className="section-subtitle mx-auto opacity-0 animate-on-scroll" style={{ animationDelay: "0.5s" }}>
              Find answers to some of the most common questions we receive.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="glass-card p-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.2s" }}>
              <h3 className="font-semibold text-lg mb-2">How quickly can I expect a response?</h3>
              <p className="text-gray-600">
                We typically respond to all inquiries within 24 hours during business days. For urgent matters, 
                please call our direct support line.
              </p>
            </div>
            
            <div className="glass-card p-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.4s" }}>
              <h3 className="font-semibold text-lg mb-2">Do you offer technical support?</h3>
              <p className="text-gray-600">
                Yes, our technical support team is available to help with any platform-related issues. 
                You can reach them through the contact form or by calling our support line.
              </p>
            </div>
            
            <div className="glass-card p-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.6s" }}>
              <h3 className="font-semibold text-lg mb-2">Can I schedule a demo of the platform?</h3>
              <p className="text-gray-600">
                Absolutely! We'd be happy to show you how Linkfro works. Simply fill out the contact form 
                with your availability and we'll set up a time that works for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
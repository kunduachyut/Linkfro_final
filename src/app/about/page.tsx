"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { ArrowRight, Github, Linkedin, Mail, Target, Lightbulb, Users, Globe, Handshake, Shield } from "lucide-react";

const About = () => {
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

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      image: "/lovable-uploads/22d31f51-c174-40a7-bd95-00e4ad00eaf3.png",
      bio: "Digital marketing veteran with 15 years of experience connecting brands with publishers.",
      social: { linkedin: "#", github: "#", email: "alex@linkfro.com" }
    },
    {
      name: "Sarah Williams",
      role: "Head of Product",
      image: "/lovable-uploads/c3d5522b-6886-4b75-8ffc-d020016bb9c2.png",
      bio: "Former Google product manager specializing in marketplace platforms and user experience.",
      social: { linkedin: "#", github: "#", email: "sarah@linkfro.com" }
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "/lovable-uploads/af412c03-21e4-4856-82ff-d1a975dc84a9.png",
      bio: "Tech entrepreneur focused on building secure and scalable digital marketplaces.",
      social: { linkedin: "#", github: "#", email: "michael@linkfro.com" }
    },
    {
      name: "Emma Rodriguez",
      role: "Head of Business Development",
      image: "/lovable-uploads/dc13e94f-beeb-4671-8a22-0968498cdb4c.png",
      bio: "Growth strategist with expertise in building publisher-advertiser relationships.",
      social: { linkedin: "#", github: "#", email: "emma@linkfro.com" }
    }
  ];

  const values = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Connectivity",
      description: "Connecting advertisers and publishers across the globe to create meaningful partnerships."
    },
    {
      icon: <Handshake className="w-6 h-6" />,
      title: "Trust & Transparency",
      description: "Building trust through transparent processes and clear communication between all parties."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security First",
      description: "Ensuring safe transactions and data protection for all users on our platform."
    }
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
                <Users className="w-3 h-3" />
              </span>
              <span>About Linkfro</span>
            </div>
            
            <h1 className="section-title mb-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.3s" }}>
              Linkfro: Where Advertisers<br />Meet Publishers
            </h1>
            
            <p className="section-subtitle mx-auto mb-8 opacity-0 animate-on-scroll" style={{ animationDelay: "0.5s" }}>
              We're building the future of digital advertising by creating a seamless marketplace that connects advertisers with the right publishers.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 relative">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="opacity-0 animate-on-scroll" style={{ animationDelay: "0.2s" }}>
              <div className="pulse-chip mb-6">
                <Target className="w-4 h-4 mr-2" />
                <span>Our Mission</span>
              </div>
              
              <h2 className="section-title mb-6">
                Bridging the Gap Between Content and Commerce
              </h2>
              
              <div className="space-y-6">
                <p className="text-lg text-gray-600 leading-relaxed">
                  At Linkfro, we believe the future of digital advertising isn't about interrupting users, but about creating valuable connections between brands and publishers.
                </p>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our platform represents years of research in digital marketing, marketplace dynamics, and user experience. We're not just building a marketplace – we're crafting a better way for content and commerce to work together.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pulse-500 rounded-full"></div>
                    <span className="text-sm font-medium">Smart Matching</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pulse-500 rounded-full"></div>
                    <span className="text-sm font-medium">Seamless Collaboration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pulse-500 rounded-full"></div>
                    <span className="text-sm font-medium">Transparent Transactions</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative opacity-0 animate-on-scroll" style={{ animationDelay: "0.4s" }}>
              <div className="glass-card p-8 hover-lift">
                <div className="aspect-video bg-gradient-to-br from-pulse-100 to-pulse-200 rounded-xl mb-6 flex items-center justify-center">
                  <Lightbulb className="w-16 h-16 text-pulse-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Innovation Through Connection</h3>
                <p className="text-gray-600">
                  Every breakthrough comes from understanding that the best advertising amplifies valuable content and creates genuine value for audiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="pulse-chip mx-auto mb-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.1s" }}>
              <Target className="w-4 h-4 mr-2" />
              <span>Our Values</span>
            </div>
            
            <h2 className="section-title mb-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.3s" }}>
              What Guides Us
            </h2>
            
            <p className="section-subtitle mx-auto opacity-0 animate-on-scroll" style={{ animationDelay: "0.5s" }}>
              The principles that shape how we build and operate our platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={value.title}
                className={cn(
                  "glass-card p-6 hover-lift opacity-0 animate-on-scroll",
                  "group transition-all duration-300"
                )}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-pulse-500 text-white flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="pulse-chip mx-auto mb-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.1s" }}>
              <Users className="w-4 h-4 mr-2" />
              <span>Our Team</span>
            </div>
            
            <h2 className="section-title mb-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.3s" }}>
              Meet the Minds Behind Linkfro
            </h2>
            
            <p className="section-subtitle mx-auto opacity-0 animate-on-scroll" style={{ animationDelay: "0.5s" }}>
              A diverse team of experts united by a shared vision of the future of digital advertising.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className={cn(
                  "glass-card p-6 text-center hover-lift opacity-0 animate-on-scroll",
                  "group transition-all duration-300"
                )}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-pulse-100 to-pulse-200 p-1">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{member.name}</h3>
                <p className="text-pulse-500 font-medium mb-3">{member.role}</p>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{member.bio}</p>
                
                <div className="flex justify-center space-x-3">
                  <a href={member.social.linkedin} className="text-gray-400 hover:text-pulse-500 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href={member.social.github} className="text-gray-400 hover:text-pulse-500 transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href={`mailto:${member.social.email}`} className="text-gray-400 hover:text-pulse-500 transition-colors">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="pulse-chip mx-auto mb-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.1s" }}>
                <Target className="w-4 h-4 mr-2" />
                <span>Our Story</span>
              </div>
              
              <h2 className="section-title mb-6 opacity-0 animate-on-scroll" style={{ animationDelay: "0.3s" }}>
                The Journey to Linkfro
              </h2>
            </div>
            
            <div className="space-y-12">
              <div className="glass-card p-8 opacity-0 animate-on-scroll" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pulse-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">The Problem</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Traditional advertising methods created friction between advertisers, publishers, and audiences. We saw an opportunity to build technology that enhances connections rather than interrupting them.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-8 opacity-0 animate-on-scroll" style={{ animationDelay: "0.7s" }}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pulse-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">The Research</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Years of studying digital marketing trends, publisher needs, and advertiser challenges led us to understand what makes truly effective advertising partnerships possible.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-8 opacity-0 animate-on-scroll" style={{ animationDelay: "0.9s" }}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pulse-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">The Solution</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Linkfro represents our solution: a digital marketplace designed to understand and adapt to the unique needs of both advertisers and publishers, creating truly collaborative partnerships.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
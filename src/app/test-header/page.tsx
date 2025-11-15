'use client';
import React from 'react';
import { HeaderWithAuth } from '@/components/ui/header-with-auth';

export default function TestHeader() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderWithAuth />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Header Component Test</h1>
        <p className="mb-4">This page tests the new header component with authentication functionality.</p>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Features</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Responsive design with mobile menu</li>
            <li>Clerk authentication integration</li>
            <li>Smooth scrolling navigation</li>
            <li>Request access functionality</li>
            <li>Sticky header with scroll effects</li>
          </ul>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Section {item}</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
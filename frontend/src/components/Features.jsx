import React from "react";

const Features = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Why Choose Synapse?
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Experience healthcare booking made simple, secure, and convenient.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition hover:-translate-y-2 border border-blue-100">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-blue-900 text-center mb-4">Easy Search</h3>
          <p className="text-gray-600 text-center leading-relaxed">
            Find the right doctor for your needs with our advanced search and filter options.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition hover:-translate-y-2 border border-blue-100">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-blue-900 text-center mb-4">Quick Booking</h3>
          <p className="text-gray-600 text-center leading-relaxed">
            Book appointments in seconds and manage your schedule from anywhere, anytime.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition hover:-translate-y-2 border border-blue-100">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-blue-900 text-center mb-4">Secure Platform</h3>
          <p className="text-gray-600 text-center leading-relaxed">
            Your personal information and medical data are protected with enterprise-grade security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Features;


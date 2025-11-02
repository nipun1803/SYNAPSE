import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-white py-12 pt-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Synapse
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Synapse is a modern healthcare platform connecting patients with trusted doctors. 
            We make booking appointments simple, convenient, and secure.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-12 shadow-lg border border-blue-100">
            <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto text-center">
              To revolutionize healthcare accessibility by providing a seamless platform 
              that connects patients with qualified medical professionals, making quality 
              healthcare more convenient and accessible for everyone.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-blue-900 text-center mb-3">Trust</h3>
            <p className="text-gray-600 text-center">
              Verified healthcare professionals you can rely on.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-blue-900 text-center mb-3">Convenience</h3>
            <p className="text-gray-600 text-center">
              Book appointments anytime, anywhere with ease.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-blue-900 text-center mb-3">Security</h3>
            <p className="text-gray-600 text-center">
              Your data is protected with industry-leading security.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">Join Our Community</h2>
          <p className="text-xl text-blue-100 text-center max-w-2xl mx-auto mb-8">
            Experience the future of healthcare booking. Simple, secure, and accessible.
          </p>
          <div className="flex justify-center">
            <a 
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Get Started Today
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;


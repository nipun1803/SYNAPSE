import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import { Calendar } from "lucide-react";

const Header = () => {
  const { token } = useContext(AuthContext);
  
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Header Left */}
          <div className="lg:w-1/2 flex flex-col items-start justify-center gap-6 p-8 lg:p-12">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl text-white font-bold leading-tight">
                Book Appointment <br /> 
                <span className="text-blue-200">With Trusted Doctors</span>
              </h1>
              <div className="flex items-center gap-4 text-blue-100">
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center -ml-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center -ml-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-lg leading-relaxed">
                  Simply browse through our extensive list of trusted doctors, 
                  schedule your appointment hassle-free.
                </p>
              </div>
            </div>
            <Link 
              to={token ? "/doctors" : "/login"}
              className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <Calendar className="w-5 h-5" />
              Book Appointment 
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Header Right */}
          <div className="lg:w-1/2 relative">
            <div className="relative">
              <img className="w-full h-auto rounded-2xl shadow-xl" src={assets.header_img} alt="Medical professionals" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;


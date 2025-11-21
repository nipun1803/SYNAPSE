import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
  return (
    <header className='bg-blue-600 rounded-2xl shadow-2xl overflow-hidden relative'>
      {/* Background Gradient Overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-90'></div>

      <div className='relative z-10 flex flex-col lg:flex-row items-center px-8 py-12 lg:p-16 gap-10'>
        
        {/* Text Content */}
        <div className='lg:w-1/2 flex flex-col items-start gap-6'>
          <h1 className='text-4xl lg:text-6xl text-white font-bold leading-tight'>
            Book Appointment <br /> 
            <span className='text-blue-200'>With Trusted Doctors</span>
          </h1>
          
          <div className='flex items-center gap-4'>
            <img className='w-28 h-auto' src={assets.group_profiles} alt="User reviews" />
            <p className='text-blue-100 text-lg leading-relaxed max-w-md'>
              Simply browse through our extensive list of trusted doctors and schedule your appointment hassle-free.
            </p>
          </div>

          <a 
            href='#speciality' 
            className='flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:shadow-lg hover:scale-105 transition-all duration-300'
          >
            Book Now 
            <img className='w-4 h-4' src={assets.arrow_icon} alt="" />
          </a>
        </div>

        {/* Hero Image */}
        <div className='lg:w-1/2 w-full'>
          <img 
            className='w-full h-auto object-cover rounded-xl shadow-lg' 
            src={assets.header_img} 
            alt="Medical team" 
          />
        </div>
      </div>
    </header>
  )
}

export default Header
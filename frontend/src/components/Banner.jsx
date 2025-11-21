import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Banner = () => {
  const navigate = useNavigate()

  return (
    <div className='py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl shadow-2xl overflow-hidden'>
          <div className='flex flex-col lg:flex-row items-center'>
            
            {/* Text Side */}
            <div className='flex-1 p-8 lg:p-12'>
              <div className='space-y-6'>
                <h2 className='text-4xl lg:text-6xl font-bold text-white leading-tight'>
                  Book Appointment
                  <br />
                  <span className='text-blue-200'>With 100+ Trusted Doctors</span>
                </h2>
                <p className='text-xl text-blue-100 leading-relaxed'>
                  Join thousands of patients who trust our platform for their healthcare needs.
                </p>
                <button 
                  onClick={() => { navigate('/unified-login'); window.scrollTo(0, 0) }} 
                  className='bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 hover:shadow-lg transform hover:scale-105 transition-all duration-300'
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Image Side */}
            <div className='lg:w-1/2 relative'>
              <div className='relative'>
                <img className='w-full h-auto lg:max-w-lg' src={assets.appointment_img} alt="appointment" />
                <div className='absolute inset-0 bg-gradient-to-l from-blue-900/20 to-transparent'></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Banner
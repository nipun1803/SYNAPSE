import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const TopDoctors = () => {
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)

  const handleDoctorClick = (id) => {
    navigate(`/appointment/${id}`)
    window.scrollTo(0, 0)
  }

  return (
    <div className='py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>Top Doctors to Book</h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Simply browse through our extensive list of trusted doctors and book your appointment with ease.
          </p>
        </div>
        
        {/* Doctor Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12'>
          {doctors.slice(0, 8).map((item) => (
            <div
              key={item._id}
              onClick={() => handleDoctorClick(item._id)}
              className='bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group'
            >
              <div className='relative'>
                <img 
                  className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300' 
                  src={item.image} 
                  alt={item.name} 
                />
                <div className='absolute top-4 right-4'>
                  <div className='flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    Available
                  </div>
                </div>
              </div>
              
              <div className='p-6'>
                <h3 className='text-xl font-semibold text-gray-900 mb-1'>{item.name}</h3>
                <p className='text-gray-600 text-sm mb-2'>{item.speciality}</p>
                <p className='text-blue-600 font-medium'>Book Appointment</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className='text-center'>
          <button 
            onClick={() => { navigate('/doctors'); window.scrollTo(0, 0) }} 
            className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-105'
          >
            View All Doctors
          </button>
        </div>

      </div>
    </div>
  )
}

export default TopDoctors
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Calendar } from 'lucide-react'

const TopDoctors = () => {
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)

  const handleDoctorClick = (id) => {
    navigate(`/appointment/${id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewAll = () => {
    navigate('/doctors')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className='py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            Top Doctors to Book
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Simply browse through our extensive list of trusted doctors and book 
            your appointment with ease.
          </p>
        </div>
        
        {/* Doctor Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12'>
          {doctors.slice(0, 8).map((doctor) => (
            <Card
              key={doctor._id}
              onClick={() => handleDoctorClick(doctor._id)}
              className='overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group border-gray-200'
            >
              {/* Doctor Image */}
              <div className='relative overflow-hidden'>
                <img 
                  className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300' 
                  src={doctor.image} 
                  alt={`Dr. ${doctor.name}`}
                />
                
                {/* Available Badge */}
                <div className='absolute top-4 right-4'>
                  <Badge 
                    variant='secondary' 
                    className='bg-green-100 text-green-700 hover:bg-green-100 border-0'
                  >
                    <span className='w-2 h-2 bg-green-500 rounded-full mr-1.5' />
                    Available
                  </Badge>
                </div>
              </div>
              
              {/* Doctor Info */}
              <CardContent className='p-6'>
                <h3 className='text-xl font-semibold text-gray-900 mb-1'>
                  {doctor.name}
                </h3>
                <p className='text-gray-600 text-sm mb-3'>
                  {doctor.speciality}
                </p>
                
                <div className='flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all duration-200'>
                  <Calendar className='w-4 h-4 mr-1.5' />
                  Book Appointment
                  <ArrowRight className='w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* View All Button */}
        <div className='text-center'>
          <Button 
            onClick={handleViewAll}
            size='lg'
            className='bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-105'
          >
            View All Doctors
            <ArrowRight className='ml-2 w-4 h-4' />
          </Button>
        </div>

      </div>
    </section>
  )
}

export default TopDoctors
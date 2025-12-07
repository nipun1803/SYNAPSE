import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Calendar } from 'lucide-react'

const TopDoctors = () => {
  const navigate = useNavigate()
  const { doctors, doctorsLoading } = useContext(AppContext)

  const handleDoctorClick = (id) => {
    navigate(`/appointment/${id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewAll = () => {
    navigate('/doctors')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className='py-16 bg-white dark:bg-gray-950'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>


        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
            Top Doctors to Book
          </h1>
          <p className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
            Simply browse through our extensive list of trusted doctors and book
            your appointment with ease.
          </p>
        </div>

        {/* Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12'>
          {doctorsLoading ? (
            // Skeleton loaders
            Array(8).fill(0).map((_, index) => (
              <Card key={index} className='overflow-hidden border-gray-200'>
                <div className='w-full h-48 bg-gray-200 animate-pulse'></div>
                <CardContent className='p-6'>
                  <div className='h-6 bg-gray-200 rounded animate-pulse mb-2'></div>
                  <div className='h-4 bg-gray-200 rounded animate-pulse w-2/3 mb-3'></div>
                  <div className='h-4 bg-gray-200 rounded animate-pulse w-1/2'></div>
                </CardContent>
              </Card>
            ))
          ) : (
            doctors.filter(doctor => doctor.available).slice(0, 8).map((doctor) => (
              <Card
                key={doctor._id}
                onClick={() => handleDoctorClick(doctor._id)}
                className='overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group border-gray-200'
              >

                <div className='relative overflow-hidden'>
                  <img
                    className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                    src={doctor.image}
                    alt={`Dr. ${doctor.name}`}
                  />

                  {doctor.available && (
                    <div className='absolute top-4 right-4'>
                      <Badge
                        variant='secondary'
                        className='bg-green-100 text-green-700 hover:bg-green-100 border-0'
                      >
                        <span className='w-2 h-2 bg-green-500 rounded-full mr-1.5' />
                        Available
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className='p-6'>
                  <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-1'>
                    {doctor.name}
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 text-sm mb-3'>
                    {doctor.speciality}
                  </p>

                  <div className='flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all duration-200'>
                    <Calendar className='w-4 h-4 mr-1.5' />
                    Book Appointment
                    <ArrowRight className='w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200' />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

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

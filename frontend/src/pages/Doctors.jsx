import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, Stethoscope, Users } from 'lucide-react'

const Doctors = () => {
  const { speciality } = useParams()
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)
  
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [showFilter, setShowFilter] = useState(false)

  const categories = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatrician',
    'Neurologist',
    'Gastroenterologist'
  ]

  useEffect(() => {
    if (speciality) {
      setFilteredDoctors(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilteredDoctors(doctors)
    }
  }, [doctors, speciality])

  const handleDoctorClick = (doctorId) => {
    navigate(`/appointment/${doctorId}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategoryClick = (category) => {
    const path = speciality === category ? '/doctors' : `/doctors/${category}`
    navigate(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className='py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2'>
          <Stethoscope className='w-7 h-7 text-blue-600' />
          Find a Doctor
        </h1>
        <p className='text-gray-600'>Browse through our specialist doctors and book an appointment</p>
      </div>

      <div className='flex flex-col sm:flex-row items-start gap-6'>
        <Button
          onClick={() => setShowFilter(!showFilter)}
          variant='outline'
          className='sm:hidden w-full justify-between h-11'
        >
          <span className='flex items-center gap-2'>
            <Filter className='w-4 h-4' />
            Filter by Specialty
          </span>
          <Badge variant='secondary' className='bg-blue-100 text-blue-700'>
            {filteredDoctors.length}
          </Badge>
        </Button>

        <aside className={`w-full sm:w-64 flex-shrink-0 ${showFilter ? 'block' : 'hidden sm:block'}`}>
          <Card className='border-gray-200 shadow-md sticky top-4'>
            <CardContent className='p-4'>
              <h3 className='text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                <Filter className='w-4 h-4' />
                Specialties
              </h3>
              <div className='space-y-2'>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      speciality === category
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className='flex-1 w-full'>
          <div className='flex items-center justify-between mb-6'>
            <p className='text-gray-600 flex items-center gap-2'>
              <Users className='w-5 h-5' />
              <span className='font-medium'>{filteredDoctors.length}</span> doctors found
            </p>
          </div>

          {filteredDoctors.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredDoctors.map((doctor, index) => (
                <Card
                  key={index}
                  onClick={() => handleDoctorClick(doctor._id)}
                  className='group overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-gray-200'
                >
                  <div className='relative overflow-hidden'>
                    <img
                      className='w-full h-56 object-cover bg-blue-50 group-hover:scale-105 transition-transform duration-300'
                      src={doctor.image}
                      alt={doctor.name}
                    />
                    {doctor.available && (
                      <Badge className='absolute top-3 right-3 bg-green-100 text-green-700 hover:bg-green-100 border-0 shadow-md'>
                        <span className='w-2 h-2 bg-green-500 rounded-full mr-1.5'></span>
                        Available
                      </Badge>
                    )}
                  </div>

                  <CardContent className='p-5'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors'>
                      {doctor.name}
                    </h3>
                    <p className='text-sm text-gray-600 mb-3'>{doctor.speciality}</p>
                    <Button
                      variant='outline'
                      className='w-full h-10 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-all'
                    >
                      Book Appointment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='text-center py-16'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Users className='w-8 h-8 text-gray-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>No doctors found</h3>
              <p className='text-gray-600 mb-6'>Try selecting a different specialty</p>
              <Button onClick={() => navigate('/doctors')} className='bg-blue-600 hover:bg-blue-700 text-white'>
                View All Doctors
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Doctors

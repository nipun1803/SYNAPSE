import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { doctorService } from '../api/services'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, Stethoscope, Users } from 'lucide-react'

const Doctors = () => {
  const { speciality } = useParams()
  const navigate = useNavigate()

  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [error, setError] = useState(null)


  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDoctors, setTotalDoctors] = useState(0)

  const categories = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatrician',
    'Neurologist',
    'Gastroenterologist'
  ]


  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])


  useEffect(() => {
    setPage(1)
  }, [speciality, searchQuery, sort])


  const fetchDoctorsList = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page,
        limit: 6,
      }

      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      if (sort) {
        params.sort = sort
      }

      if (speciality) {
        params.speciality = speciality
      }

      const data = await doctorService.getList(params)

      if (data && data.success) {
        setDoctors(data.doctors || [])
        setTotalPages(data.pagination?.pages || 1)
        setTotalDoctors(data.pagination?.total || 0)
      } else {
        setError(data?.message || 'Failed to fetch doctors')
        setDoctors([])
        setTotalDoctors(0)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setError(error.message || 'Failed to load doctors')
      setDoctors([])
      setTotalDoctors(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctorsList()
  }, [speciality, page, searchQuery, sort])

  const handleDoctorClick = (doctorId) => {
    navigate(`/appointment/${doctorId}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategoryClick = (category) => {
    const path = speciality === category ? '/doctors' : `/doctors/${category}`
    navigate(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchQuery('')
    setSort('')
    setPage(1)
    navigate('/doctors')
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
            {totalDoctors}
          </Badge>
        </Button>

        <aside className={`w-full sm:w-64 flex-shrink-0 ${showFilter ? 'block' : 'hidden sm:block'}`}>
          <Card className='border-gray-200 shadow-md sticky top-4'>
            <CardContent className='p-4 space-y-6'>

              {/* search */}
              <div>
                <h3 className='text-sm font-semibold text-gray-900 mb-3'>Search</h3>
                <input
                  type="text"
                  placeholder="Search doctor..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput !== searchQuery && (
                  <p className="text-xs text-gray-500 mt-1">Searching...</p>
                )}
              </div>

              {/* sort */}
              <div>
                <h3 className='text-sm font-semibold text-gray-900 mb-3'>Sort By</h3>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="fees_asc">Fees: Low to High</option>
                  <option value="fees_desc">Fees: High to Low</option>
                  <option value="experience_asc">Experience: Low to High</option>
                  <option value="experience_desc">Experience: High to Low</option>
                </select>
              </div>

              {/* categories */}
              <div>
                <h3 className='text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                  <Filter className='w-4 h-4' />
                  Specialties
                </h3>
                <div className='space-y-2'>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${speciality === category
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>


              {(searchQuery || sort || speciality) && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="w-full text-sm"
                >
                  Clear All Filters
                </Button>
              )}

            </CardContent>
          </Card>
        </aside>

        <div className='flex-1 w-full'>
          <div className='flex items-center justify-between mb-6'>
            <p className='text-gray-600 flex items-center gap-2'>
              <Users className='w-5 h-5' />
              {loading ? (
                <span className='font-medium'>Loading...</span>
              ) : (
                <>
                  <span className='font-medium'>{doctors.length}</span>
                  {doctors.length === 1 ? ' doctor' : ' doctors'} found
                  {totalDoctors > doctors.length && (
                    <span className="text-sm text-gray-500">
                      ({totalDoctors} total)
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {error ? (
            <div className='text-center py-16'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Users className='w-8 h-8 text-red-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Error loading doctors</h3>
              <p className='text-gray-600 mb-6'>{error}</p>
              <Button onClick={fetchDoctorsList} className='bg-blue-600 hover:bg-blue-700 text-white'>
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : doctors.length > 0 ? (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {doctors.map((doctor) => (
                  <Card
                    key={doctor._id}
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
                      <p className='text-sm text-gray-600 mb-2'>{doctor.speciality}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>Exp: {doctor.experience}</span>
                        <span className="font-medium text-gray-900">Fees: ₹{doctor.fees}</span>
                      </div>

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

              {/* pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPage(prev => Math.max(prev - 1, 1))
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPage(prev => Math.min(prev + 1, totalPages))
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className='text-center py-16'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Users className='w-8 h-8 text-gray-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>No doctors found</h3>
              <p className='text-gray-600 mb-6'>Try adjusting your search or filters</p>
              <Button onClick={handleClearFilters} className='bg-blue-600 hover:bg-blue-700 text-white'>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Doctors
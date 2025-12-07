import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { resolveImageUrl } from '../../lib/resolveImageUrl'
import { toast } from 'react-toastify'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, CheckCircle, XCircle, Search, Trash2, LayoutGrid, List as ListIcon } from 'lucide-react'

const DoctorsList = () => {
  const { doctors, changeAvailability, aToken, getAllDoctors } = useContext(AdminContext)
  const { backendUrl, currency } = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  useEffect(() => {
    if (aToken) {
      setLoading(true)
      getAllDoctors().finally(() => setLoading(false))
    }
  }, [aToken])

  const toSrc = (img, fallback) => {
    const src = resolveImageUrl(img, backendUrl)
    return src && !/^data:\s*$/i.test(src) ? src : fallback
  }

  const handleAvailabilityToggle = async (docId) => {
    await changeAvailability(docId)
  }

  const handleDeleteDoctor = async (docId, docName) => {
    if (!confirm(`Are you sure you want to delete Dr. ${docName}? This action cannot be undone.`)) return

    try {
      setDeleting(docId)
      const res = await fetch(`${backendUrl}/api/admin/doctors/${docId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await res.json()

      if (data.success) {
        toast.success(data.message || 'Doctor deleted successfully')
        getAllDoctors()
      } else {
        toast.error(data.message || 'Failed to delete doctor')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete doctor')
    } finally {
      setDeleting(null)
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    let availabilityMatch = true
    if (filter === 'available') availabilityMatch = doctor.available
    if (filter === 'unavailable') availabilityMatch = !doctor.available

    const searchMatch = searchTerm === '' ||
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.speciality?.toLowerCase().includes(searchTerm.toLowerCase())

    return availabilityMatch && searchMatch
  })

  const availableCount = doctors.filter(d => d.available).length
  const unavailableCount = doctors.filter(d => !d.available).length

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='p-6 max-w-7xl mx-auto space-y-6'>

      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Doctors List</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>Manage all registered doctors</p>
        </div>
        <div className='flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700'>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size='sm'
            onClick={() => setViewMode('grid')}
            className='gap-2'
          >
            <LayoutGrid className='w-4 h-4' />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size='sm'
            onClick={() => setViewMode('list')}
            className='gap-2'
          >
            <ListIcon className='w-4 h-4' />
            List
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
        <Card className='dark:bg-gray-800 dark:border-gray-700'>
          <CardContent className='p-5 flex items-center justify-between'>
            <div>
              <p className='text-gray-600 dark:text-gray-400 text-sm font-medium mb-1'>Total Doctors</p>
              <p className='text-3xl font-bold text-gray-900 dark:text-white'>{doctors.length}</p>
            </div>
            <div className='w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center'>
              <Users className='w-6 h-6 text-blue-600' />
            </div>
          </CardContent>
        </Card>
        <Card className='dark:bg-gray-800 dark:border-gray-700'>
          <CardContent className='p-5 flex items-center justify-between'>
            <div>
              <p className='text-gray-600 dark:text-gray-400 text-sm font-medium mb-1'>Available</p>
              <p className='text-3xl font-bold text-gray-900 dark:text-white'>{availableCount}</p>
            </div>
            <div className='w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center'>
              <CheckCircle className='w-6 h-6 text-green-600' />
            </div>
          </CardContent>
        </Card>
        <Card className='dark:bg-gray-800 dark:border-gray-700'>
          <CardContent className='p-5 flex items-center justify-between'>
            <div>
              <p className='text-gray-600 dark:text-gray-400 text-sm font-medium mb-1'>Unavailable</p>
              <p className='text-3xl font-bold text-gray-900 dark:text-white'>{unavailableCount}</p>
            </div>
            <div className='w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center'>
              <XCircle className='w-6 h-6 text-red-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className='dark:bg-gray-800 dark:border-gray-700'>
        <CardContent className='p-4'>
          <div className='flex flex-col sm:flex-row gap-4 justify-between'>
            <div className='flex gap-2'>
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                size='sm'
                className={filter === 'all' ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
              >
                All
              </Button>
              <Button
                onClick={() => setFilter('available')}
                variant={filter === 'available' ? 'default' : 'outline'}
                size='sm'
                className={filter === 'available' ? 'bg-green-600 text-white hover:bg-green-700' : ''}
              >
                Available
              </Button>
              <Button
                onClick={() => setFilter('unavailable')}
                variant={filter === 'unavailable' ? 'default' : 'outline'}
                size='sm'
                className={filter === 'unavailable' ? 'bg-red-600 text-white hover:bg-red-700' : ''}
              >
                Unavailable
              </Button>
            </div>
            <div className='relative w-full sm:w-72'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search by name or speciality...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white dark:bg-gray-900 dark:text-white'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center'>
          <h2 className='font-semibold text-gray-900 dark:text-white'>All Doctors</h2>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            Showing {filteredDoctors.length} of {doctors.length}
          </span>
        </div>

        {filteredDoctors.length > 0 ? (
          viewMode === 'grid' ? (
            <div className='p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {filteredDoctors.map((item) => (
                <div
                  key={item._id}
                  className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group'
                >
                  <div className='relative h-52 bg-gray-100 dark:bg-gray-900 overflow-hidden'>
                    <img
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                      src={toSrc(item.image, assets.doctor_icon)}
                      alt={item.name}
                    />
                    <div className='absolute top-3 right-3'>
                      <Badge variant={item.available ? 'default' : 'destructive'} className={item.available ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>

                  <div className='p-5'>
                    <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-1'>Dr. {item.name}</h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>{item.speciality}</p>
                    <p className='text-xs text-gray-500 dark:text-gray-500 mb-4 line-clamp-2'>{item.about}</p>

                    <div className='flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700'>
                      <span>{item.experience} Exp</span>
                      <span className='font-bold text-gray-900 dark:text-white'>{currency}{item.fees}</span>
                    </div>

                    <div className='flex items-center justify-between gap-3'>
                      <div className='flex items-center gap-2'>
                        <input
                          type='checkbox'
                          checked={!!item.available}
                          onChange={() => handleAvailabilityToggle(item._id)}
                          className='w-4 h-4 text-primary rounded border-gray-300 dark:border-gray-600 focus:ring-primary'
                        />
                        <span className='text-sm text-gray-700 dark:text-gray-300'>Available</span>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteDoctor(item._id, item.name)}
                        disabled={deleting === item._id}
                        className='text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-auto'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
                  <tr>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider'>Doctor</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider'>Speciality</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider'>Experience</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider'>Fees</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider'>Status</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800'>
                  {filteredDoctors.map((item) => (
                    <tr key={item._id} className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <img
                            src={toSrc(item.image, assets.doctor_icon)}
                            alt={item.name}
                            className='w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700'
                          />
                          <div>
                            <p className='text-sm font-semibold text-gray-900 dark:text-white'>Dr. {item.name}</p>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>{item.degree}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-700 dark:text-gray-300'>{item.speciality}</td>
                      <td className='px-6 py-4 text-sm text-gray-700 dark:text-gray-300'>{item.experience}</td>
                      <td className='px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white'>{currency}{item.fees}</td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <input
                            type='checkbox'
                            checked={!!item.available}
                            onChange={() => handleAvailabilityToggle(item._id)}
                            className='w-4 h-4 text-primary rounded border-gray-300 dark:border-gray-600 focus:ring-primary'
                          />
                          <Badge variant={item.available ? 'default' : 'secondary'} className={item.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}>
                            {item.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteDoctor(item._id, item.name)}
                          disabled={deleting === item._id}
                          className='text-red-600 hover:text-red-700 hover:bg-red-50'
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className='text-center py-16'>
            <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Search className='h-8 w-8 text-gray-400 dark:text-gray-500' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>No doctors found</h3>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              {searchTerm
                ? `No results for "${searchTerm}"`
                : filter === 'all'
                  ? 'No doctors registered yet.'
                  : `No ${filter} doctors found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorsList
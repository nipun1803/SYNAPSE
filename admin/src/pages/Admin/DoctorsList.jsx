import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { resolveImageUrl } from '../../utils/resolveImageUrl'
import { toast } from 'react-toastify'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, CheckCircle, XCircle, Search, Trash2 } from 'lucide-react'

const DoctorsList = () => {
  const { doctors, changeAvailability, aToken, getAllDoctors } = useContext(AdminContext)
  const { backendUrl, currency } = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState(null)

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
    <div className='p-6 max-w-7xl mx-auto'>

      {/* Page Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Doctors List</h1>
        <p className='text-gray-600 mt-1'>Manage all registered doctors</p>
      </div>

      {/* Stats Cards - Simple white cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6'>
        <div className='bg-white border border-gray-200 rounded-xl p-5'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium mb-1'>Total Doctors</p>
              <p className='text-3xl font-bold text-gray-900'>{doctors.length}</p>
            </div>
            <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center'>
              <svg className='w-6 h-6 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
              </svg>
            </div>
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-xl p-5'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium mb-1'>Available</p>
              <p className='text-3xl font-bold text-gray-900'>{availableCount}</p>
            </div>
            <div className='w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center'>
              <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-xl p-5'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium mb-1'>Unavailable</p>
              <p className='text-3xl font-bold text-gray-900'>{unavailableCount}</p>
            </div>
            <div className='w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center'>
              <svg className='w-6 h-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filtering and search*/}
      <div className='bg-white border border-gray-200 rounded-xl p-5 mb-5'>
        <div className='space-y-4'>
          <div className='flex gap-2'>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All ({doctors.length})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'available'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Available ({availableCount})
            </button>
            <button
              onClick={() => setFilter('unavailable')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'unavailable'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Unavailable ({unavailableCount})
            </button>
          </div>


          <input
            type='text'
            placeholder='Search by name or speciality...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
          />
        </div>
      </div>

      {/* Doctors menu */}
      <div className='bg-white border border-gray-200 rounded-xl overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
          <div className='flex items-center justify-between'>
            <h2 className='font-semibold text-gray-900'>All Doctors</h2>
            <span className='text-sm text-gray-600'>
              Showing {filteredDoctors.length} of {doctors.length}
            </span>
          </div>
        </div>

        {filteredDoctors.length > 0 ? (
          <div className='p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
            {filteredDoctors.map((item) => (
              <div
                key={item._id}
                className='bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow'
              >
                {/* doc img */}
                <div className='relative h-48 bg-gray-100'>
                  <img
                    className='w-full h-full object-cover'
                    src={toSrc(item.image, assets.doctor_icon)}
                    alt={item.name}
                  />
                  {/* avail button */}
                  <div className='absolute top-3 right-3'>
                    {item.available ? (
                      <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200'>
                        Available
                      </span>
                    ) : (
                      <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200'>
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>

                {/* doc inf */}
                <div className='p-4'>
                  <h3 className='text-base font-semibold text-gray-900 mb-1'>
                    Dr. {item.name}
                  </h3>
                  <p className='text-sm text-gray-600 mb-1'>{item.speciality}</p>
                  <p className='text-xs text-gray-500 mb-3'>{item.degree}</p>

                  <div className='flex items-center justify-between text-sm text-gray-600 mb-3 pb-3 border-b border-gray-200'>
                    <span>{item.experience}</span>
                    <span className='font-semibold text-gray-900'>{currency}{item.fees}</span>
                  </div>


                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-700'>Status</span>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={!!item.available}
                        onChange={() => handleAvailabilityToggle(item._id)}
                        className='sr-only peer'
                      />
                      <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${item.available ? 'peer-checked:bg-green-600' : ''
                        }`}></div>
                    </label>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteDoctor(item._id, item.name)}
                    disabled={deleting === item._id}
                    className='mt-3 w-full px-3 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition'
                  >
                    {deleting === item._id ? 'Deleting...' : 'Delete Doctor'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>No doctors found</h3>
            <p className='mt-1 text-sm text-gray-500'>
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
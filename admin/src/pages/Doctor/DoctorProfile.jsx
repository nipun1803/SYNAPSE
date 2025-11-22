import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (!profileData?.about?.trim()) {
      toast.error('About section is required')
      return false
    }
    if (!profileData?.fees || profileData.fees <= 0) {
      toast.error('Please enter a valid consultation fee')
      return false
    }
    if (!profileData?.address?.line1?.trim()) {
      toast.error('Address Line 1 is required')
      return false
    }
    return true
  }

  const updateProfile = async () => {
    if (!profileData) return
    if (!validateForm()) return

    try {
      setLoading(true)
      const updateData = {
        address: {
          line1: profileData.address.line1.trim(),
          line2: profileData.address.line2?.trim() || ''
        },
        fees: Number(profileData.fees),
        about: profileData.about.trim(),
        available: profileData.available,
      }

      const { data } = await axios.put(
        `/api/doctors/me/profile`,
        updateData,
        { withCredentials: true }
      )

      if (data.success) {
        toast.success('Profile updated successfully')
        setIsEdit(false)
        await getProfileData()
      } else {
        toast.error(data.message || 'Update failed')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error?.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEdit(false)
    getProfileData() // Reset to original data
  }

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken])

  if (!profileData) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-4xl mx-auto'>
        
        {/* Profile Header Card */}
        <div className='bg-white rounded-lg shadow-sm mb-6 overflow-hidden'>
          {/* Cover Image */}
          <div className='h-32 bg-gradient-to-r from-green-500 to-teal-600'></div>
          
          {/* Profile Info */}
          <div className='px-6 pb-6'>
            <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-12'>
              {/* Profile Picture */}
              <div className='mb-4 sm:mb-0'>
                <img
                  src={profileData.image}
                  alt='Doctor Profile'
                  className='w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg'
                />
              </div>

              {/* Edit Button */}
              {!isEdit && (
                <button
                  onClick={() => setIsEdit(true)}
                  className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition'
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Name and Credentials */}
            <div className='mt-4'>
              <h1 className='text-2xl font-bold text-gray-900'>{profileData.name}</h1>
              <div className='flex items-center gap-2 mt-2 text-gray-600'>
                <span className='font-medium'>{profileData.degree}</span>
                <span>•</span>
                <span>{profileData.speciality}</span>
                <span className='px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full'>
                  {profileData.experience}
                </span>
              </div>
              <p className='text-gray-500 mt-1'>{profileData.email}</p>
            </div>
          </div>
        </div>

        {/* Professional Information Card */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Professional Information</h2>

          <div className='space-y-6'>
            
            {/* About */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                About {isEdit && <span className='text-red-500'>*</span>}
              </label>
              {isEdit ? (
                <textarea
                  onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none'
                  rows={6}
                  value={profileData.about}
                  placeholder='Write about your experience, expertise, and qualifications...'
                />
              ) : (
                <p className='text-gray-900 whitespace-pre-wrap'>{profileData.about}</p>
              )}
            </div>

            {/* Consultation Fee */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Consultation Fee {isEdit && <span className='text-red-500'>*</span>}
              </label>
              {isEdit ? (
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                    {currency}
                  </span>
                  <input
                    type='number'
                    min='0'
                    step='1'
                    className='w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    onChange={(e) => setProfileData(prev => ({ ...prev, fees: Number(e.target.value) }))}
                    value={profileData.fees}
                    placeholder='Enter consultation fee'
                  />
                </div>
              ) : (
                <p className='text-gray-900 text-lg font-semibold'>
                  {currency} {profileData.fees}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Clinic Address {isEdit && <span className='text-red-500'>*</span>}
              </label>
              {isEdit ? (
                <div className='space-y-3'>
                  <input
                    type='text'
                    placeholder='Street address, building name'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, line1: e.target.value } 
                    }))}
                    value={profileData.address.line1}
                  />
                  <input
                    type='text'
                    placeholder='City, State, Zip Code (optional)'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, line2: e.target.value } 
                    }))}
                    value={profileData.address.line2}
                  />
                </div>
              ) : (
                <div className='text-gray-900'>
                  <p>{profileData.address.line1}</p>
                  {profileData.address.line2 && <p>{profileData.address.line2}</p>}
                </div>
              )}
            </div>

            {/* Availability Toggle */}
            <div className='border-t pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Availability Status
                  </label>
                  <p className='text-xs text-gray-500 mt-1'>
                    {profileData.available 
                      ? 'You are currently accepting appointments' 
                      : 'You are not accepting new appointments'}
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type="checkbox"
                    disabled={!isEdit}
                    onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
                    checked={profileData.available}
                    className='sr-only peer'
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    profileData.available ? 'peer-checked:bg-green-600' : ''
                  } ${!isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                </label>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          {isEdit && (
            <div className='flex gap-3 mt-6 pt-6 border-t'>
              <button
                onClick={updateProfile}
                disabled={loading}
                className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition'
              >
                {loading ? (
                  <span className='flex items-center gap-2'>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className='px-6 py-2 border border-gray-300 hover:bg-gray-50 font-medium rounded-lg transition'
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Info Banner */}
        {!isEdit && (
          <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
            <div className='flex gap-3'>
              <svg className='w-5 h-5 text-green-600 flex-shrink-0 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              <div>
                <p className='text-sm text-green-900 font-medium'>Keep your profile updated</p>
                <p className='text-sm text-green-700 mt-1'>
                  Your profile information helps patients make informed decisions when booking appointments. 
                  Make sure your availability status reflects your current schedule.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorProfile
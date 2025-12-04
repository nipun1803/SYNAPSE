import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { resolveImageUrl } from '../lib/resolveImageUrl'
import { userService } from '../api/services'

const MyProfile = () => {
  const { backendUrl, loadProfile } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const fetchProfile = async () => {
    try {
      if (!userData) setLoading(true)
      const data = await userService.getProfile()

      if (data.success) {
        setUserData({
          ...data.userData,
          address: data.userData.address || { line1: '', line2: '' },
          gender: data.userData.gender || '',
          phone: data.userData.phone || '',
          dob: data.userData.dob || '',
          weight: data.userData.weight || ''
        })
      } else {
        toast.error(data.message || 'Failed to load profile')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) return toast.error('Please select an image file')
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be less than 5MB')

    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const onSave = async () => {
    const { name, phone, gender } = userData

    if (!name || !phone || !gender) {
      return toast.error('Please fill all required fields')
    }

    try {
      setSaving(true)
      const form = new FormData()
      form.append('name', name.trim())
      form.append('phone', phone.trim())
      form.append('gender', gender)
      form.append('dob', userData.dob || '')
      form.append('weight', userData.weight || '')
      form.append('address', JSON.stringify(userData.address))

      if (imageFile) form.append('image', imageFile)

      const data = await userService.updateProfile(form)

      if (data.success) {
        toast.success('Profile updated successfully!')
        setIsEdit(false)
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        setImageFile(null)
        setImagePreview(null)
        await fetchProfile()
        if (loadProfile) await loadProfile()
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setIsEdit(false)
    setImageFile(null)
    setImagePreview(null)
    fetchProfile()
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const data = await userService.deleteAccount()
        if (data.success) {
          toast.success('Account deleted successfully')
          if (loadProfile) await loadProfile()
        } else {
          toast.error(data.message || 'Failed to delete account')
        }
      } catch (error) {
        console.error('Delete account error:', error)
        toast.error('Failed to delete account')
      }
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }

  const getDisplayImage = () => {
    if (imagePreview) return imagePreview
    if (userData?.image) return resolveImageUrl(userData.image, backendUrl)
    return null
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className='flex flex-col justify-center items-center min-h-[60vh]'>
        <svg className='w-16 h-16 text-gray-400 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
        <p className='text-gray-500'>Failed to load profile data</p>
        <button onClick={() => fetchProfile()} className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8'>
      <div className='max-w-3xl mx-auto px-4'>

        {/* Header Card */}
        <div className='bg-white rounded-2xl shadow-lg overflow-hidden mb-6'>
          <div className='h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'></div>

          <div className='px-6 pb-6'>
            <div className='flex flex-col sm:flex-row sm:items-end gap-4 -mt-14'>

              {/* Profile Photo Section */}
              <div className='relative flex-shrink-0'>
                <div className='w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white'>
                  {getDisplayImage() ? (
                    <img
                      src={getDisplayImage()}
                      alt='Profile'
                      className='w-full h-full object-cover'
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className='w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold'>
                      {getInitials(userData?.name)}
                    </div>
                  )}
                </div>

                {/* Upload Button - Always visible in edit mode */}
                {isEdit && (
                  <label className='absolute -bottom-1 -right-1 w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg cursor-pointer flex items-center justify-center transition-all border-2 border-white'>
                    <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                    <input type='file' accept='image/*' onChange={handleImageChange} className='hidden' />
                  </label>
                )}
              </div>

              {/* Name & Email */}
              <div className='flex-1 pt-2 sm:pt-0'>
                <h1 className='text-2xl font-bold text-gray-900'>{userData.name}</h1>
                <p className='text-gray-500 text-sm mt-0.5'>{userData.email}</p>
              </div>

              {/* Edit Button */}
              {!isEdit && (
                <button
                  onClick={() => setIsEdit(true)}
                  className='self-start sm:self-end px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm'
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className='bg-white rounded-2xl shadow-lg p-6'>
          <div className='flex items-center justify-between mb-6 pb-4 border-b'>
            <h2 className='text-lg font-semibold text-gray-900'>Personal Information</h2>
            {isEdit && <span className='text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded'>* Required fields</span>}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>

            {/* Full Name */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1.5'>
                Full Name {isEdit && <span className='text-red-500'>*</span>}
              </label>
              {isEdit ? (
                <input
                  type='text'
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm'
                  placeholder='Enter your full name'
                />
              ) : (
                <p className='text-gray-900 py-2'>{userData.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1.5'>Email Address</label>
              <p className='text-gray-500 py-2 text-sm'>{userData.email}</p>
              {isEdit && <p className='text-xs text-gray-400 mt-0.5'>Email cannot be changed</p>}
            </div>

            {/* Phone */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1.5'>
                Phone Number {isEdit && <span className='text-red-500'>*</span>}
              </label>
              {isEdit ? (
                <input
                  type='tel'
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm'
                  placeholder='Enter phone number'
                />
              ) : (
                <p className='text-gray-900 py-2'>{userData.phone || '-'}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1.5'>
                Gender {isEdit && <span className='text-red-500'>*</span>}
              </label>
              {isEdit ? (
                <select
                  value={userData.gender}
                  onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                  className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white'
                >
                  <option value=''>Select Gender</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
              ) : (
                <p className='text-gray-900 py-2'>{userData.gender || '-'}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1.5'>Date of Birth</label>
              {isEdit ? (
                <input
                  type='date'
                  value={userData.dob ? userData.dob.split('T')[0] : ''}
                  onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm'
                />
              ) : (
                <p className='text-gray-900 py-2'>
                  {userData.dob ? new Date(userData.dob).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) : '-'}
                </p>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1.5'>Weight (kg)</label>
              {isEdit ? (
                <input
                  type='number'
                  value={userData.weight || ''}
                  onChange={(e) => setUserData({ ...userData, weight: e.target.value })}
                  min='1'
                  max='500'
                  className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm'
                  placeholder='Enter weight in kg'
                />
              ) : (
                <p className='text-gray-900 py-2'>{userData.weight ? `${userData.weight} kg` : '-'}</p>
              )}
            </div>

            {/* Address - Full Width */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-600 mb-1.5'>Address</label>
              {isEdit ? (
                <div className='space-y-3'>
                  <input
                    type='text'
                    placeholder='Address Line 1'
                    value={userData.address.line1}
                    onChange={(e) => setUserData({ ...userData, address: { ...userData.address, line1: e.target.value } })}
                    className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm'
                  />
                  <input
                    type='text'
                    placeholder='Address Line 2 (Optional)'
                    value={userData.address.line2}
                    onChange={(e) => setUserData({ ...userData, address: { ...userData.address, line2: e.target.value } })}
                    className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm'
                  />
                </div>
              ) : (
                <p className='text-gray-900 py-2'>
                  {[userData.address.line1, userData.address.line2].filter(Boolean).join(', ') || '-'}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEdit && (
            <div className='flex gap-3 mt-8 pt-6 border-t'>
              <button
                onClick={onSave}
                disabled={saving}
                className='px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm'
              >
                {saving ? (
                  <span className='flex items-center gap-2'>
                    <svg className='animate-spin h-4 w-4' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className='px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50'
              >
                Cancel
              </button>
            </div>
          )}

          {/* Delete Account */}
          {!isEdit && (
            <div className='mt-8 pt-6 border-t border-gray-100'>
              <button
                onClick={handleDeleteAccount}
                className='text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-2 transition-colors'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                </svg>
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyProfile
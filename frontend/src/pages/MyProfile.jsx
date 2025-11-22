import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { resolveImageUrl } from '../utils/resolveImageUrl'

const MyProfile = () => {
  const { backendUrl, loadUserProfileData } = useContext(AppContext) // for loading user data
  

  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState(null)
  
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const fetchProfile = async () => {
    try {

      if (!userData) setLoading(true)
      
      const res = await fetch(`${backendUrl || ''}/api/users/profile`, { credentials: 'include' })
      const data = await res.json()

      if (data.success) {

        setUserData({
          ...data.userData,
          address: data.userData.address || { line1: '', line2: '' },
          gender: data.userData.gender || '', 
          phone: data.userData.phone || '',
          dob: data.userData.dob || ''
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
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) return toast.error('Please select an image file')
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be less than 5MB')


    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const onSave = async () => {
    const { name, phone, gender, dob } = userData
    
    if (!name || !phone || !gender) {
      return toast.error('Please fill all required fields')
    }

    try {
      setSaving(true)
      const form = new FormData()
      form.append('name', name.trim())
      form.append('phone', phone.trim())
      form.append('gender', gender)
      form.append('dob', dob || '')
      form.append('address', JSON.stringify(userData.address))
      
      if (imageFile) form.append('image', imageFile)

      const res = await fetch(`${backendUrl || ''}/api/users/profile`, {
        method: 'PUT',
        credentials: 'include',
        body: form
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success('Profile updated successfully!')
        setIsEdit(false)
        
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview)
        }
        setImageFile(null)
        setImagePreview(null)
        
        await fetchProfile()
        
        if (loadUserProfileData) {
          await loadUserProfileData()
        }
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
    // Cleanup preview
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    
    setIsEdit(false)
    setImageFile(null)
    setImagePreview(null)
    fetchProfile() // Reset changes by re-fetching
  }

  // Helper to determine which image to show
  const getDisplayImage = () => {
    if (imagePreview) return imagePreview
    if (userData?.image) return resolveImageUrl(userData.image, backendUrl)
    return assets.profile_pic
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
        <button 
          onClick={() => fetchProfile()} 
          className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        
        {/* Profile Header */}
        <div className='bg-white rounded-lg shadow-sm mb-6 overflow-hidden'>
          <div className='h-32 bg-gradient-to-r from-blue-500 to-indigo-600'></div>
          
          <div className='px-6 pb-6'>
            <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-12'>
              
              {/* Avatar Section */}
              <div className='relative mb-4 sm:mb-0'>
                <img
                  src={getDisplayImage()}
                  alt='Profile'
                  className='w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg bg-white'
                  onError={(e) => { e.target.src = assets.profile_pic }}
                />
                
                {/* Edit Image Overlay */}
                {isEdit && (
                  <div className='absolute bottom-0 right-0'>
                    <label className='flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-md cursor-pointer border border-gray-200 transition-colors'>
                      <svg className='w-5 h-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
                      </svg>
                      <input type='file' accept='image/*' onChange={handleImageChange} className='hidden' />
                    </label>
                  </div>
                )}
              </div>

              {!isEdit && (
                <button
                  onClick={() => setIsEdit(true)}
                  className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors'
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className='mt-4'>
              <h1 className='text-2xl font-bold text-gray-900'>{userData.name}</h1>
              <p className='text-gray-500 mt-1'>{userData.email}</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-lg font-semibold text-gray-900'>Personal Information</h2>
            {isEdit && <span className='text-xs text-gray-500'>* Required</span>}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            
            <Field label="Full Name" required={isEdit}>
              {isEdit ? (
                <input
                  type='text'
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                  className='form-input'
                  placeholder='Enter your full name'
                />
              ) : <p className='text-gray-900'>{userData.name}</p>}
            </Field>

            <Field label="Email Address">
              <p className='text-gray-500 text-sm'>{userData.email}</p>
              {isEdit && <p className='text-xs text-gray-400 mt-1'>Email cannot be changed</p>}
            </Field>

            <Field label="Phone Number" required={isEdit}>
              {isEdit ? (
                <input
                  type='tel'
                  value={userData.phone}
                  onChange={(e) => setUserData({...userData, phone: e.target.value})}
                  className='form-input'
                  placeholder='Enter phone number'
                />
              ) : <p className='text-gray-900'>{userData.phone || '-'}</p>}
            </Field>

            <Field label="Gender" required={isEdit}>
              {isEdit ? (
                <select
                  value={userData.gender}
                  onChange={(e) => setUserData({...userData, gender: e.target.value})}
                  className='form-input'
                >
                  <option value=''>Select Gender</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
              ) : <p className='text-gray-900'>{userData.gender || '-'}</p>}
            </Field>

            <Field label="Date of Birth">
              {isEdit ? (
                <input
                  type='date'
                  value={userData.dob ? userData.dob.split('T')[0] : ''}
                  onChange={(e) => setUserData({...userData, dob: e.target.value})}
                  max={new Date().toISOString().split('T')[0]}
                  className='form-input'
                />
              ) : (
                <p className='text-gray-900'>
                  {userData.dob ? new Date(userData.dob).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : '-'}
                </p>
              )}
            </Field>

            <div className='md:col-span-2'>
              <Field label="Address">
                {isEdit ? (
                  <div className='space-y-3'>
                    <input
                      type='text'
                      placeholder='Address Line 1'
                      value={userData.address.line1}
                      onChange={(e) => setUserData({...userData, address: {...userData.address, line1: e.target.value}})}
                      className='form-input'
                    />
                    <input
                      type='text'
                      placeholder='Address Line 2 (Optional)'
                      value={userData.address.line2}
                      onChange={(e) => setUserData({...userData, address: {...userData.address, line2: e.target.value}})}
                      className='form-input'
                    />
                  </div>
                ) : (
                  <p className='text-gray-900'>
                    {[userData.address.line1, userData.address.line2].filter(Boolean).join(', ') || '-'}
                  </p>
                )}
              </Field>
            </div>
          </div>

          {isEdit && (
            <div className='flex gap-3 mt-8 pt-6 border-t'>
              <button onClick={onSave} disabled={saving} className='btn-primary'>
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
              <button onClick={handleCancel} disabled={saving} className='btn-secondary'>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* CSS Utility classes */}
      <style>{`
        .form-input {
          width: 100%; padding: 0.625rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem;
          outline: none; transition: all 0.2s; font-size: 0.875rem;
        }
        .form-input:focus { border-color: #2563eb; ring: 2px solid #eff6ff; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        .btn-primary {
          padding: 0.625rem 1.5rem; background-color: #2563eb; color: white; font-weight: 500;
          border-radius: 0.5rem; transition: all 0.2s; font-size: 0.875rem;
        }
        .btn-primary:hover:not(:disabled) { background-color: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .btn-primary:disabled { background-color: #9ca3af; cursor: not-allowed; }
        .btn-secondary {
          padding: 0.625rem 1.5rem; border: 1px solid #d1d5db; font-weight: 500;
          border-radius: 0.5rem; transition: all 0.2s; background-color: white; font-size: 0.875rem;
        }
        .btn-secondary:hover:not(:disabled) { background-color: #f9fafb; transform: translateY(-1px); }
        .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}

// Simple wrapper component to clean up the render return
const Field = ({ label, required, children }) => (
  <div>
    <label className='block text-sm font-medium text-gray-700 mb-2'>
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    {children}
  </div>
)

export default MyProfile
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [loading, setLoading] = useState(false)

  const { backendUrl, aToken, getAllDoctors } = useContext(AdminContext)
  const currency = import.meta.env.VITE_CURRENCY || '₹'

  const UPLOAD_PLACEHOLDER = useMemo(
    () => assets?.upload_area || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
    []
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const resetForm = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setDocImg(null)
    setPreviewUrl('')
    setName('')
    setEmail('')
    setPassword('')
    setExperience('1 Year')
    setFees('')
    setAbout('')
    setSpeciality('General physician')
    setDegree('')
    setAddress1('')
    setAddress2('')
  }

  const onImageChange = (e) => {
    try {
      const file = e.target.files?.[0]
      if (!file) {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setDocImg(null)
        setPreviewUrl('')
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      const MAX = 5 * 1024 * 1024
      if (file.size > MAX) {
        toast.error('Image size must be 5MB or less')
        return
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl)

      const url = URL.createObjectURL(file)
      setDocImg(file)
      setPreviewUrl(url)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load the selected image')
    }
  }

  const removeSelectedImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setDocImg(null)
    setPreviewUrl('')
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (!docImg) {
        return toast.error('Please upload a doctor photo')
      }

      if (!name.trim() || !email.trim() || !password || !degree.trim() || !address1.trim()) {
        return toast.error('Please fill all required fields')
      }

      if (password.length < 6) {
        return toast.error('Password must be at least 6 characters')
      }

      setLoading(true)

      const formData = new FormData()
      formData.append('image', docImg)
      formData.append('name', name.trim())
      formData.append('email', email.trim())
      formData.append('password', password)
      formData.append('experience', experience)
      formData.append('fees', Number(fees))
      formData.append('about', about.trim())
      formData.append('speciality', speciality)
      formData.append('degree', degree.trim())
      formData.append('address', JSON.stringify({ line1: address1.trim(), line2: address2.trim() }))

      const { data } = await axios.post(
        `${backendUrl}/api/admin/doctors`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      )

      if (data?.success) {
        toast.success(data.message || 'Doctor added successfully')
        resetForm()
        getAllDoctors()
      } else {
        toast.error(data?.message || 'Failed to add doctor')
      }
    } catch (error) {
      console.error('Add doctor error:', error)
      toast.error(error?.response?.data?.message || error?.message || 'Failed to add doctor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='p-6 page-transition'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 flex items-center gap-3'>
            <div className='p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg'>
              <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
            </div>
            Add New Doctor
          </h1>
          <p className='text-slate-600 mt-2'>Fill in the details to register a new doctor</p>
        </div>

        <form onSubmit={onSubmitHandler} className='space-y-6'>
          {/* Photo Upload Section */}
          <div className='bg-white rounded-2xl shadow-lg border border-slate-200 p-8'>
            <h2 className='text-xl font-bold text-slate-900 mb-6 flex items-center gap-2'>
              <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
              Doctor Photo
            </h2>

            <div className='flex items-center gap-6'>
              <div className='relative group'>
                <label htmlFor='doc-img' className='cursor-pointer block'>
                  <div className='w-32 h-32 rounded-2xl overflow-hidden border-4 border-slate-200 group-hover:border-blue-500 transition-all duration-300 shadow-lg group-hover:shadow-xl'>
                    <img
                      className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                      src={previewUrl || UPLOAD_PLACEHOLDER}
                      alt='Upload'
                    />
                  </div>
                  <div className='absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                    <svg className='w-10 h-10 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                  </div>
                </label>
                <input onChange={onImageChange} type='file' id='doc-img' hidden accept='image/*' />
              </div>

              <div className='flex-1'>
                <h3 className='text-sm font-bold text-slate-900 mb-2'>Upload Requirements</h3>
                <ul className='text-sm text-slate-600 space-y-1'>
                  <li className='flex items-center gap-2'>
                    <svg className='w-4 h-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                    Professional headshot photo
                  </li>
                  <li className='flex items-center gap-2'>
                    <svg className='w-4 h-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                    Maximum file size: 5MB
                  </li>
                  <li className='flex items-center gap-2'>
                    <svg className='w-4 h-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                    Formats: JPG, PNG, WEBP
                  </li>
                </ul>

                {previewUrl && (
                  <button
                    type='button'
                    onClick={removeSelectedImage}
                    className='mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors duration-200 flex items-center gap-2'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                    </svg>
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className='bg-white rounded-2xl shadow-lg border border-slate-200 p-8'>
            <h2 className='text-xl font-bold text-slate-900 mb-6 flex items-center gap-2'>
              <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
              </svg>
              Basic Information
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-bold text-slate-900 mb-2'>
                  Full Name <span className='text-red-600'>*</span>
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className='w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none'
                  type='text'
                  placeholder='Dr. John Doe'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-bold text-slate-900 mb-2'>
                  Email Address <span className='text-red-600'>*</span>
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className='w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none'
                  type='email'
                  placeholder='doctor@example.com'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-bold text-slate-900 mb-2'>
                  Password <span className='text-red-600'>*</span>
                </label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className='w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none'
                  type='password'
                  placeholder='Minimum 6 characters'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-bold text-slate-900 mb-2'>
                  Education / Degree <span className='text-red-600'>*</span>
                </label>
                <input
                  onChange={(e) => setDegree(e.target.value)}
                  value={degree}
                  className='w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none'
                  type='text'
                  placeholder='MBBS, MD'
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className='bg-white rounded-2xl shadow-lg border border-slate-200 p-8'>
            <h2 className='text-xl font-bold text-slate-900 mb-6 flex items-center gap-2'>
              <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
              </svg>
              Professional Details
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-bold text-slate-900 mb-2'>Speciality</label>
                <select
                  onChange={(e) => setSpeciality(e.target.value)}
                  value={speciality}
                  className='w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none'
                >
                  <option value='General physician'>General Physician</option>
                  <option value='Gynecologist'>Gynecologist</option>
                  <option value='Dermatologist'>Dermatologist</option>
                  <option value='Pediatricians'>Pediatricians</option>
                  <option value='Neurologist'>Neurologist</option>
                  <option value='Gastroenterologist'>Gastroenterologist</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-bold text-slate-900 mb-2'>Experience</label>
                <select
                  onChange={(e) => setExperience(e.target.value)}
                  value={experience}
                  className='w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none'
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(year => (
                    <option key={year} value={`${year} Year${year > 1 ? 's' : ''}`}>
                      {year} Year{year > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-bold text-slate-900 mb-2'>
                  Consultation Fee ({currency})
                </label>
                <input
                  onChange={(e) => setFees(e.target.value)}
                  value={fees}
                  className='w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none'
                  type='number'
                  placeholder='500'
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className='bg-white rounded-2xl shadow-lg border border-slate-200 p-8'>
            <h2 className='text-xl font-bold text-slate-900 mb-6 flex items-center gap-2'>
              <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
              </svg>
              Clinic Address
            </h2>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-bold text-slate-900 mb-2'>
                  Address Line 1 <span className='text-red-600'>*</span>
                </label>
                <input
                  onChange={(e) => setAddress1(e.target.value)}
                  value={address1}
                  className='w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none'
                  type='text'
                  placeholder='Street address, building name'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-bold text-slate-900 mb-2'>
                  Address Line 2
                </label>
                <input
                  onChange={(e) => setAddress2(e.target.value)}
                  value={address2}
                  className='w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none'
                  type='text'
                  placeholder='City, State, Zip Code'
                />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className='bg-white rounded-2xl shadow-lg border border-slate-200 p-8'>
            <h2 className='text-xl font-bold text-slate-900 mb-6 flex items-center gap-2'>
              <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
              About Doctor
            </h2>

            <textarea
              onChange={(e) => setAbout(e.target.value)}
              value={about}
              className='w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none resize-none'
              placeholder='Write about the doctor&#39;s experience, expertise, and qualifications...'
              rows={6}
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className='flex gap-4'>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <svg className='animate-spin h-5 w-5' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Adding Doctor...
                </>
              ) : (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                  </svg>
                  Add Doctor
                </>
              )}
            </button>

            <button
              type='button'
              onClick={resetForm}
              className='px-6 py-4 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all duration-200 hover:scale-105 active:scale-95'
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDoctor
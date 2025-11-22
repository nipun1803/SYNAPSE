import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Doctors = () => {
    const { speciality } = useParams()
    const [filterDoc, setFilterDoc] = useState([])
    const [showFilter, setShowFilter] = useState(false)
    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)

    const applyFilter = () => {
        if (speciality) {
            setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
        } else {
            setFilterDoc(doctors)
        }
    }

    useEffect(() => {
        applyFilter()
    }, [doctors, speciality])

    const categories = [
        'General physician', 'Gynecologist', 'Dermatologist', 
        'Pediatrician', 'Neurologist', 'Gastroenterologist'
    ]

    return (
        <div>
            <p className='text-gray-600'>Browse through the doctors specialist.</p>
            <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
                
                {/* Filter Button for Mobile */}
                <button 
                    onClick={() => setShowFilter(!showFilter)} 
                    className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`}
                >
                    Filters
                </button>
                
                {/* Sidebar */}
                <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
                    {categories.map((cat) => (
                        <p 
                            key={cat}
                            onClick={() => speciality === cat ? navigate('/doctors') : navigate(`/doctors/${cat}`)} 
                            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === cat ? 'bg-indigo-100 text-black' : 'hover:bg-gray-50'}`}
                        >
                            {cat}
                        </p>
                    ))}
                </div>

                {/* Grid */}
                <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
                    {filterDoc.map((item, index) => (
                        <div 
                            key={index}
                            onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0) }} 
                            className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
                        >
                            <img className='bg-blue-50' src={item.image} alt="" />
                            <div className='p-4'>
                                <div className='flex items-center gap-2 text-sm text-center text-green-500'>
                                    <p className='w-2 h-2 bg-green-500 rounded-full'></p>
                                    <p>Available</p>
                                </div>
                                <p className='text-neutral-800 text-lg font-medium'>{item.name}</p>
                                <p className='text-zinc-600 text-sm'>{item.speciality}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Doctors
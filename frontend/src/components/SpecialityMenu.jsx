import React from 'react'
import { Link } from 'react-router-dom'
import { specialityData } from '../assets/assets'
import { ChevronRight } from 'lucide-react'

const SpecialityMenu = () => {
    const handleSpecialityClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <section id='speciality' className='py-16 bg-gray-50 dark:bg-gray-900'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-12'>
                    <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
                        Find by Speciality
                    </h1>
                    <p className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
                        Simply browse through our extensive list of trusted doctors,
                        schedule your appointment hassle-free.
                    </p>
                </div>

                {/* Grid */}
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6'>
                    {specialityData.map((item, index) => (
                        <Link
                            to={`/doctors/${item.speciality}`}
                            onClick={handleSpecialityClick}
                            className='group flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-transparent dark:border-gray-700'
                            key={index}
                            aria-label={`View ${item.speciality} doctors`}
                        >

                            <div className='relative w-16 h-16 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors duration-300'>
                                <img
                                    className='w-10 h-10'
                                    src={item.image}
                                    alt=''
                                    aria-hidden='true'
                                />
                                <ChevronRight className='absolute -right-1 -bottom-1 w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                            </div>

                            <p className='text-sm font-medium text-gray-700 dark:text-gray-300 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300'>
                                {item.speciality}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default SpecialityMenu

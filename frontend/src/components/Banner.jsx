import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Calendar, Users, Shield } from 'lucide-react'

const Banner = () => {
  const navigate = useNavigate()

  const handleCreateAccount = () => {
    navigate('/unified-login')
    window.scrollTo(0, 0)
  }

  const features = [
    { icon: Calendar, label: 'Easy Booking' },
    { icon: Users, label: '100+ Doctors' },
    { icon: Shield, label: 'Trusted Care' }
  ]

  return (
    <div className='py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <Card className='bg-gradient-to-r from-blue-600 to-blue-800 border-0 rounded-3xl shadow-2xl overflow-hidden'>
          <div className='flex flex-col lg:flex-row items-center'>
            
            <div className='flex-1 p-8 lg:p-12'>
              <div className='space-y-6'>
                <Badge variant="secondary" className='bg-blue-500 hover:bg-blue-500 text-white border-0'>
                  Welcome to Synapse
                </Badge>
                
                <h2 className='text-4xl lg:text-6xl font-bold text-white leading-tight'>
                  Book Appointment
                  <br />
                  <span className='text-blue-200'>With 100+ Trusted Doctors</span>
                </h2>
                
                <p className='text-xl text-blue-100 leading-relaxed'>
                  Join thousands of patients who trust our platform for their healthcare needs.
                </p>

                <div className='flex flex-wrap gap-4 py-2'>
                  {features.map((feature) => {
                    const IconComponent = feature.icon
                    return (
                      <div 
                        key={feature.label}
                        className='flex items-center gap-2 text-blue-100'
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className='text-sm font-medium'>{feature.label}</span>
                      </div>
                    )
                  })}
                </div>

                <Button 
                  onClick={handleCreateAccount}
                  size="lg"
                  className='bg-white text-blue-600 hover:bg-blue-50 hover:shadow-lg group'
                >
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            <div className='lg:w-1/2 relative'>
              <div className='relative'>
                <img 
                  className='w-full h-auto lg:max-w-lg' 
                  src='https://res.cloudinary.com/dvowfjsb4/image/upload/c_crop,w_600,h_700/v1764692847/doctor-with-his-arms-crossed-white-background-removebg-preview_dbsyvz.png'
                  alt="appointment" 
                />
                <div className='absolute inset-0 bg-gradient-to-l from-blue-900/20 to-transparent'></div>
              </div>
            </div>

          </div>
        </Card>
      </div>
    </div>
  )
}

export default Banner
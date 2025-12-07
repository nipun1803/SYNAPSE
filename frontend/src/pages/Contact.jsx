import React from 'react'
import { assets } from '../assets/assets'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, Briefcase } from 'lucide-react'

const Contact = () => {
  return (
    <section className='py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
      <div className='text-center mb-12'>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-white'>
          Contact <span className='text-blue-600'>Us</span>
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mt-2'>Get in touch with our team</p>
      </div>

      <div className='flex flex-col md:flex-row gap-12 items-center justify-center'>
        <div className='w-full md:w-auto flex-shrink-0'>
          <img
            className='w-full md:max-w-[360px] rounded-2xl shadow-lg'
            src={assets.contact_image}
            alt='Contact Synapse healthcare'
          />
        </div>

        <div className='flex flex-col gap-8 max-w-lg'>
          <Card className='border-gray-200 dark:border-gray-700 shadow-md'>
            <CardContent className='p-6'>
              <div className='flex items-start gap-3 mb-4'>
                <div className='w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <MapPin className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>Headquarters</h2>
                  <p className='text-gray-600 dark:text-gray-400 leading-relaxed'>
                    Synapse Tech Park, Building C<br />
                    100 Health Valley Dr, Suite 200<br />
                    San Francisco, CA 94107
                  </p>
                </div>
              </div>

              <div className='space-y-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
                <div className='flex items-center gap-3 text-gray-600 dark:text-gray-400'>
                  <Phone className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                  <span className='text-sm'>Support: (415) 555-0132</span>
                </div>
                <div className='flex items-center gap-3 text-gray-600 dark:text-gray-400'>
                  <Mail className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                  <span className='text-sm'>Email: support@synapse-health.com</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-gray-200 dark:border-gray-700 shadow-md'>
            <CardContent className='p-6'>
              <div className='flex items-start gap-3 mb-4'>
                <div className='w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <Briefcase className='w-5 h-5 text-green-600 dark:text-green-400' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>Careers at Synapse</h2>
                  <p className='text-gray-600 dark:text-gray-400 leading-relaxed'>
                    Learn more about our teams and job openings.
                  </p>
                </div>
              </div>

              <Button className='w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-semibold transition-all hover:shadow-lg'>
                <Briefcase className='w-4 h-4 mr-2' />
                Explore Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Contact
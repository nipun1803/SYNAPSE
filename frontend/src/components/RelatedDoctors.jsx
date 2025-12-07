import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

const RelatedDoctors = ({ speciality, docId }) => {
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)
  const [relatedDoctors, setRelatedDoctors] = useState([])

  useEffect(() => {
    if (!doctors.length || !speciality) return

    const filtered = doctors.filter(
      (doc) => doc.speciality === speciality && doc._id !== docId
    )

    setRelatedDoctors(filtered)
  }, [doctors, speciality, docId])

  const handleDoctorClick = (doctorId) => {
    navigate(`/appointment/${doctorId}`)
    window.scrollTo(0, 0)
  }

  if (!relatedDoctors.length) return null

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 dark:text-gray-100">
      <h2 className="text-3xl font-semibold">Related Doctors</h2>
      <p className="sm:w-1/3 text-center text-sm text-gray-600 dark:text-gray-400">
        Doctors with similar specialities you might want to check out.
      </p>

      <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {relatedDoctors.map((doctor) => (
          <Card
            key={doctor._id}
            className="overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-blue-200 dark:border-gray-700 dark:bg-gray-800 group"
            onClick={() => handleDoctorClick(doctor._id)}
          >
            <div className="relative">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="bg-blue-100 w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Badge
                variant="secondary"
                className="absolute top-3 right-3 bg-green-500 hover:bg-green-500 text-white border-0"
              >
                Available
              </Badge>
            </div>

            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {doctor.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{doctor.speciality}</p>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDoctorClick(doctor._id)
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default RelatedDoctors
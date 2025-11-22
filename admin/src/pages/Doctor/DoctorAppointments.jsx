import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } =
    useContext(DoctorContext)

  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!dToken) return
    setLoading(true)

    getAppointments()
      .catch(err => console.error("Error fetching appointments:", err))
      .finally(() => setLoading(false))

  }, [dToken])

  const filteredList = appointments.filter(appt => {
    switch (filter) {
      case "upcoming":
        return !appt.cancelled && !appt.isCompleted
      case "completed":
        return appt.isCompleted
      case "cancelled":
        return appt.cancelled
      default:
        return true
    }
  })

  const onCancel = async (id) => {
    const ok = window.confirm("Cancel this appointment?")
    if (ok) await cancelAppointment(id)
  }

  const onComplete = async (id) => {
    const ok = window.confirm("Mark this appointment as completed?")
    if (ok) await completeAppointment(id)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 rounded-full border-2 border-gray-300 border-t-green-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-5">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">My Appointments</h1>
        <p className="text-sm text-gray-500">Review and manage all booked sessions</p>
      </div>

      {/* Updated Stats Section (colored headers + numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">

        <div className="bg-white border rounded-md p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700">Total</p>
          <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
        </div>

        <div className="bg-white border rounded-md p-4 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">
            {appointments.filter(a => !a.cancelled && !a.isCompleted).length}
          </p>
        </div>

        <div className="bg-white border rounded-md p-4 shadow-sm">
          <p className="text-sm font-medium text-green-700">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {appointments.filter(a => a.isCompleted).length}
          </p>
        </div>

        <div className="bg-white border rounded-md p-4 shadow-sm">
          <p className="text-sm font-medium text-red-700">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">
            {appointments.filter(a => a.cancelled).length}
          </p>
        </div>

      </div>

      {/* Filters */}
      <div className="border bg-white rounded-md p-3 mb-6">
        <div className="flex gap-3 overflow-x-auto">
          {[
            { label: "All", key: "all" },
            { label: "Upcoming", key: "upcoming" },
            { label: "Completed", key: "completed" },
            { label: "Cancelled", key: "cancelled" }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-4 py-2 rounded-md text-sm transition ${
                filter === btn.key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white border rounded-md overflow-hidden">
        {filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr className="text-left text-xs text-gray-600 uppercase">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Age</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Fee</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredList.map((item, index) => (
                  <tr key={item._id || index} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm">{index + 1}</td>

                    {/* Patient */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.userData?.image || assets.profile_pic}
                          className="w-10 h-10 rounded-full border object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium">{item.userData?.name || "Unknown"}</p>
                          <p className="text-xs text-gray-500">{item.userData?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Age */}
                    <td className="px-5 py-4 text-sm">
                      {calculateAge(item.userData?.dob) || "-"}
                    </td>

                    {/* Date & Time */}
                    <td className="px-5 py-4 text-sm">
                      <p className="font-medium">{slotDateFormat(item.slotDate)}</p>
                      <p className="text-gray-500">{item.slotTime}</p>
                    </td>

                    {/* Payment */}
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-md ${
                          item.payment
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.payment ? "Online" : "Cash"}
                      </span>
                    </td>

                    {/* Fee */}
                    <td className="px-5 py-4 text-sm font-medium">
                      {currency}{item.amount}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {item.cancelled ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md">
                          Cancelled
                        </span>
                      ) : item.isCompleted ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md">
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                          Upcoming
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      {!item.cancelled && !item.isCompleted ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onComplete(item._id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => onCancel(item._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No {filter !== "all" ? filter : ""} appointments found.
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorAppointments
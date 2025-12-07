import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { Star, X } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'

const ReviewModal = ({ appointment, isOpen, onClose, onSuccess }) => {
    const { backendUrl, token, userData } = useContext(AppContext)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [hover, setHover] = useState(0)
    const [submitting, setSubmitting] = useState(false)

    if (!isOpen || !appointment) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (rating === 0) {
            toast.error("Please select a rating")
            return
        }
        if (!comment.trim()) {
            toast.error("Please write a comment")
            return
        }

        setSubmitting(true)
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/reviews/add`,
                {
                    docId: appointment.docData._id,
                    rating,
                    comment
                    // backend handles userId/userData from auth token or looks it up
                },
                { headers: { token } }
            )

            if (data.success) {
                toast.success("Review submitted!")
                if (onSuccess) onSuccess()
                onClose()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.message || 'Failed to submit review')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn'>
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all'>
                {/* Header */}
                <div className='flex justify-between items-center p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'>
                    <h2 className='text-lg font-bold text-gray-800 dark:text-white'>Rate Your Experience</h2>
                    <button onClick={onClose} className='p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors'>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className='p-6'>
                    <div className='flex items-center gap-4 mb-6'>
                        <img
                            src={appointment.docData.image}
                            alt=""
                            className='w-14 h-14 rounded-full object-cover border-2 border-primary/20'
                        />
                        <div>
                            <p className='text-gray-900 dark:text-white font-semibold text-lg'>Dr. {appointment.docData.name}</p>
                            <p className='text-gray-500 dark:text-gray-400 text-sm'>{appointment.docData.speciality}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-5'>
                        <div className='flex flex-col items-center gap-2'>
                            <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>How was your appointment?</p>
                            <div className='flex gap-1'>
                                {[...Array(5)].map((_, index) => {
                                    const ratingValue = index + 1
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`transition-all duration-200 p-1 ${ratingValue <= (hover || rating) ? "text-yellow-400 scale-110" : "text-gray-300"
                                                }`}
                                            onClick={() => setRating(ratingValue)}
                                            onMouseEnter={() => setHover(ratingValue)}
                                            onMouseLeave={() => setHover(0)}
                                        >
                                            <Star
                                                size={32}
                                                fill={ratingValue <= (hover || rating) ? "currentColor" : "none"}
                                                strokeWidth={2}
                                            />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Write a review</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className='w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-primary focus:ring-1 focus:ring-primary/50 text-sm resize-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
                                placeholder="Tell us about your experience..."
                                required
                            ></textarea>
                        </div>

                        <button
                            type='submit'
                            disabled={submitting}
                            className='w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center'
                        >
                            {submitting ? (
                                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ReviewModal

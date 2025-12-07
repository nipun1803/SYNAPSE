import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { Ban, CheckCircle, Search, History, User } from 'lucide-react'
import UserAppointmentsModal from './UserAppointmentsModal'

const UsersList = () => {
    const { users, aToken, getAllUsers, changeUserStatus } = useContext(AdminContext)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    useEffect(() => {
        if (aToken) {
            getAllUsers()
        }
    }, [aToken])

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleViewHistory = (userId) => {
        setSelectedUserId(userId)
        setIsHistoryOpen(true)
    }

    return (
        <div className='m-5'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
                <h1 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>All Users</h1>
                <div className='relative w-full sm:w-72'>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className='w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm dark:text-white'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className='w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2' />
                </div>
            </div>

            <div className='bg-white dark:bg-gray-800 border dark:border-gray-700 text-sm rounded-xl overflow-hidden shadow-sm'>
                {/* Desktop Table Header */}
                <div className='hidden md:grid grid-cols-[0.5fr_1fr_2fr_1fr_1fr_0.5fr_1fr] grid-flow-col py-4 px-6 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 items-center font-medium text-gray-500 dark:text-gray-400'>
                    <p>#</p>
                    <p>Profile</p>
                    <p>Name</p>
                    <p>Email</p>
                    <p>Phone</p>
                    <p>Status</p>
                    <p className='text-right'>Actions</p>
                </div>

                {/* Content */}
                {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
                        <User className='w-12 h-12 text-gray-300 dark:text-gray-600 mb-3' />
                        <p className='text-lg font-medium text-gray-600 dark:text-gray-300'>No users found</p>
                        <p className='text-sm'>Try adjusting your search terms</p>
                    </div>
                ) : (
                    <div className='divide-y divide-gray-100 dark:divide-gray-700'>
                        {filteredUsers.map((item, index) => (
                            <React.Fragment key={index}>
                                {/* Desktop View */}
                                <div className='hidden md:grid grid-cols-[0.5fr_1fr_2fr_1fr_1fr_0.5fr_1fr] grid-flow-col items-center py-4 px-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors'>
                                    <p className='text-gray-500 dark:text-gray-400 font-mono'>{index + 1}</p>
                                    <div className='flex items-center'>
                                        <div className='w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700'>
                                            <img
                                                className='w-full h-full object-cover'
                                                src={item.image || 'https://via.placeholder.com/40'}
                                                alt="user"
                                                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + item.name + '&background=random' }}
                                            />
                                        </div>
                                    </div>
                                    <p className='font-medium text-gray-900 dark:text-white'>{item.name}</p>
                                    <p className='text-gray-600 dark:text-gray-300 truncate pr-4' title={item.email}>{item.email}</p>
                                    <p className='text-gray-600 dark:text-gray-300 font-mono text-xs'>{item.phone}</p>
                                    <div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.blocked
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
                                            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800'
                                            }`}>
                                            {item.blocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </div>
                                    <div className='flex justify-end gap-2'>
                                        <button
                                            onClick={() => handleViewHistory(item._id)}
                                            className='group p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all tooltip-trigger'
                                            title="View History"
                                        >
                                            <History className='w-4 h-4' />
                                        </button>
                                        <button
                                            onClick={() => changeUserStatus(item._id)}
                                            className={`p-2 rounded-lg transition-all ${item.blocked
                                                ? 'text-green-600 hover:bg-green-50'
                                                : 'text-red-500 hover:bg-red-50'
                                                }`}
                                            title={item.blocked ? "Unblock User" : "Block User"}
                                        >
                                            {item.blocked ? <CheckCircle className='w-4 h-4' /> : <Ban className='w-4 h-4' />}
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile View (Card Layout) */}
                                <div className='md:hidden p-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors'>
                                    <div className='flex items-start justify-between mb-3'>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-12 h-12 rounded-full border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700'>
                                                <img
                                                    className='w-full h-full object-cover'
                                                    src={item.image || 'https://via.placeholder.com/40'}
                                                    alt="user"
                                                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + item.name + '&background=random' }}
                                                />
                                            </div>
                                            <div>
                                                <h3 className='font-semibold text-gray-900 dark:text-white'>{item.name}</h3>
                                                <p className='text-xs text-gray-500 dark:text-gray-400'>{item.email}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${item.blocked
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
                                            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800'
                                            }`}>
                                            {item.blocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </div>

                                    <div className='flex items-center justify-between mt-4 border-t border-gray-100 pt-3'>
                                        <p className='text-xs text-gray-500 font-mono'>{item.phone}</p>
                                        <div className='flex gap-2'>
                                            <button
                                                onClick={() => handleViewHistory(item._id)}
                                                className='px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-1'
                                            >
                                                <History className='w-3 h-3' /> History
                                            </button>
                                            <button
                                                onClick={() => changeUserStatus(item._id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${item.blocked
                                                    ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30'
                                                    : 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30'
                                                    }`}
                                            >
                                                {item.blocked ? <><CheckCircle className='w-3 h-3' /> Unblock</> : <><Ban className='w-3 h-3' /> Block</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            <UserAppointmentsModal
                userId={selectedUserId}
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />
        </div>
    )
}

export default UsersList

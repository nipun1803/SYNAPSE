import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import { AdminContext } from '../../context/AdminContext';
import { SocketContext } from '../../context/SocketContext';
import { Send, ArrowLeft, MessageSquare, Paperclip, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorChat = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { dToken, profileData } = useContext(DoctorContext);
    const { backendUrl } = useContext(AdminContext);
    const { socket } = useContext(SocketContext);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [receiverName, setReceiverName] = useState('Patient');
    const [receiverId, setReceiverId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch Messages & Appointment Details
    useEffect(() => {
        if (!dToken || !appointmentId) return;

        const fetchData = async () => {
            try {
                // 1. Get History
                const { data } = await axios.get(`${backendUrl}/api/chat/history/${appointmentId}`, {
                    withCredentials: true
                });
                if (data.success) {
                    setMessages(data.chats);
                }

                // 2. We need patient info (Receiver). 
                // Ideally this comes from the Appointment List context, or we fetch appointment details.
                // For now, let's try to infer from the existing chat or fetch appointment if needed.
                // Since we don't have a direct "getAppointmentById" API handy for simple doctor usage, 
                // we can rely on the DoctorContext's cached appointments if loaded, or fetch fresh.
                // Let's rely on the first message or wait for patient to chat? No, better to search the Context.
            } catch (error) {
                toast.error("Failed to load chats");
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        socket?.emit('join_chat', appointmentId);

        const handleReceiveMessage = (message) => {
            if (message.appointmentId === appointmentId) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
        };

        socket?.on('receive_message', handleReceiveMessage);

        return () => {
            socket?.off('receive_message', handleReceiveMessage);
        };

    }, [dToken, appointmentId, socket, backendUrl]);

    // Fetch Appointment Details directly via API
    useEffect(() => {
        if (!dToken || !appointmentId) return;

        const fetchAppointmentDetails = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/doctors/me/appointments/${appointmentId}`, {
                    withCredentials: true
                });
                if (data.success && data.appointment) {
                    setReceiverName(data.appointment.userData?.name || 'Patient');
                    setReceiverId(data.appointment.userId);
                } else {
                    toast.error("Appointment not found");
                    navigate('/doctor-appointments');
                }
            } catch (error) {
                console.error("Failed to fetch appointment:", error);
                toast.error("Failed to load appointment details");
                navigate('/doctor-appointments');
            }
        };

        fetchAppointmentDetails();
    }, [dToken, appointmentId, backendUrl, navigate]);

    // Track socket connection status
    useEffect(() => {
        if (!socket) {
            setIsConnected(false);
            return;
        }

        // Set initial connection status
        setIsConnected(socket.connected);

        // Listen for connection events
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
        };
    }, [socket]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !profileData || !receiverId) {
            if (!receiverId) toast.warning("Patient details not loaded yet");
            return;
        }

        const messageData = {
            appointmentId,
            senderId: profileData._id,
            senderModel: 'doctor',
            receiverId,
            receiverModel: 'user',
            message: newMessage.trim()
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    if (loading) return <div className="p-10 text-center">Loading chat...</div>;

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 py-3 shadow-md border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={() => navigate('/doctor-appointments')}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                                    {receiverName.charAt(0).toUpperCase()}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{receiverName}</h2>
                                <p className={`text-xs font-medium flex items-center gap-1 ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    {isConnected ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 max-w-6xl mx-auto w-full">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare size={64} className="mb-3 opacity-15" />
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === profileData._id;
                        return (
                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-md ${isMe
                                        ? 'bg-primary text-white rounded-br-sm'
                                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-sm'
                                        }`}>
                                        <p className="leading-relaxed">{msg.message}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-2">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                <form onSubmit={handleSendMessage} className="max-w-6xl mx-auto flex items-center gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:bg-white dark:focus:bg-gray-600 transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || !receiverId}
                        className="bg-primary text-white p-3.5 rounded-full hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
                        title="Send message"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DoctorChat;

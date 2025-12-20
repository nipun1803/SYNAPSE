import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { SocketContext } from '../context/SocketContext';
import { Send, ArrowLeft, MessageSquare, Paperclip, Phone, Video } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const ChatPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, userData } = useContext(AppContext);
    const { socket } = useContext(SocketContext);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [appointmentLoading, setAppointmentLoading] = useState(true);
    const [currentAppointment, setCurrentAppointment] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch Appointment Details directly via API
    useEffect(() => {
        if (!userData || !appointmentId) return;

        const fetchAppointment = async () => {
            try {
                setAppointmentLoading(true);
                const { data } = await axios.get(`${backendUrl}/api/users/appointments/${appointmentId}`, {
                    withCredentials: true
                });
                if (data.success) {
                    setCurrentAppointment(data.appointment);
                } else {
                    toast.error("Appointment not found");
                    navigate('/my-appointments');
                }
            } catch (error) {
                console.error("Failed to fetch appointment:", error);
                toast.error("Failed to load appointment details");
                navigate('/my-appointments');
            } finally {
                setAppointmentLoading(false);
            }
        };

        fetchAppointment();
    }, [userData, appointmentId, backendUrl, navigate]);

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

    // Fetch History & Socket setup
    useEffect(() => {
        if (!userData || !appointmentId) return;

        const fetchHistory = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/chat/history/${appointmentId}`, {
                    withCredentials: true
                });
                if (data.success) {
                    setMessages(data.chats);
                }
            } catch (error) {
                toast.error("Failed to load chats");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();

        // Join Room
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

    }, [userData, appointmentId, socket, backendUrl]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !userData || !currentAppointment) return;

        const messageData = {
            appointmentId,
            senderId: userData._id,
            senderModel: 'user',
            receiverId: currentAppointment.docData._id,
            receiverModel: 'doctor',
            message: newMessage.trim()
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    if (loading || appointmentLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading chat...</div>;
    }

    if (!currentAppointment) return null;

    return (
        <div className="flex flex-col min-h-[500px] md:h-[calc(100vh-140px)] bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 shadow-md border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                        <button
                            onClick={() => navigate('/my-appointments')}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0"
                        >
                            <ArrowLeft size={20} className="sm:w-[22px] sm:h-[22px]" />
                        </button>
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="relative flex-shrink-0">
                                <img
                                    src={currentAppointment.docData.image}
                                    alt={currentAppointment.docData.name}
                                    className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base truncate">Dr. {currentAppointment.docData.name}</h2>
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {currentAppointment.docData.speciality}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 max-w-6xl mx-auto w-full">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                        <MessageSquare size={48} className="sm:w-16 sm:h-16 mb-3 opacity-15" />
                        <p className="text-xs sm:text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === userData._id;
                        return (
                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                <div className={`flex flex-col max-w-[90%] sm:max-w-[80%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm shadow-md ${isMe
                                        ? 'bg-primary text-white rounded-br-sm'
                                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-sm'
                                        }`}>
                                        <p className="leading-relaxed break-words">{msg.message}</p>
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-2">
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
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                <form onSubmit={handleSendMessage} className="max-w-6xl mx-auto flex items-center gap-2 sm:gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-full px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-primary/50 focus:bg-white dark:focus:bg-gray-600 dark:text-white transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-primary text-white p-2.5 sm:p-3.5 rounded-full hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
                        title="Send message"
                    >
                        <Send size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;

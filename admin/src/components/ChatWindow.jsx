import React, { useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { Send, X, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChatWindow = ({ appointmentId, receiverId, receiverName, isOpen, onClose }) => {
    const { socket } = useContext(SocketContext);
    const { backendUrl } = useContext(AdminContext);
    const { dToken, profileData } = useContext(DoctorContext);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (!isOpen || !appointmentId) return;

        socket?.emit('join_chat', appointmentId);

        const fetchHistory = async () => {
            setLoading(true);
            try {
                // Doctor uses dToken
                const headers = { token: dToken };

                const { data } = await axios.get(`${backendUrl}/api/chat/history/${appointmentId}`, { headers });
                if (data.success) {
                    setMessages(data.chats);
                }
            } catch (error) {
                console.error("Failed to load chat history", error);
                toast.error("Could not load chat history");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();

        const handleReceiveMessage = (message) => {
            if (message.appointmentId === appointmentId) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket?.on('receive_message', handleReceiveMessage);

        return () => {
            socket?.off('receive_message', handleReceiveMessage);
        };

    }, [isOpen, appointmentId, socket, backendUrl, dToken]);


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

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

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-[500px] animate-fadeIn">
            {/* Header */}
            <div className="bg-blue-600 px-4 py-3 rounded-t-lg flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <MessageSquare size={18} />
                    <span className="font-semibold truncate max-w-[200px]">{receiverName || 'Patient Chat'}</span>
                </div>
                <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                {loading ? (
                    <div className="flex justify-center items-center h-full text-gray-400 text-sm">Loading...</div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs">
                        <p>No messages yet.</p>
                        <p>Start conversation with patient.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === profileData?._id;
                        return (
                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm break-words ${isMe
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    <p>{msg.message}</p>
                                    <span className={`text-[10px] block mt-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white rounded-b-lg flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-50"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;

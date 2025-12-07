import React, { useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AppContext } from '../context/AppContext';
import { Send, X, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChatWindow = ({ appointmentId, receiverId, receiverName, isOpen, onClose, role = 'user' }) => {
    const { socket } = useContext(SocketContext);
    const { backendUrl, token, userData } = useContext(AppContext); // Adjust for DoctorContext in Admin app
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Load History & Join Room
    useEffect(() => {
        if (!isOpen || !appointmentId) return;

        // Join Room
        socket?.emit('join_chat', appointmentId);

        // Fetch History
        const fetchHistory = async () => {
            setLoading(true);
            try {
                // Determine headers based on role (User uses 'token', Doctor/Admin might differ)
                // Assuming this component is shared or headers are handled.
                // For User App:
                const headers = { token };

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

        // Listener for new messages
        const handleReceiveMessage = (message) => {
            // Only append if it belongs to this appointment (socket room helps, but good to check)
            if (message.appointmentId === appointmentId) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket?.on('receive_message', handleReceiveMessage);

        return () => {
            socket?.off('receive_message', handleReceiveMessage);
        };

    }, [isOpen, appointmentId, socket, backendUrl, token]);


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            appointmentId,
            senderId: userData._id, // Ensure userData is available
            senderModel: role, // 'user' or 'doctor'
            receiverId,
            receiverModel: role === 'user' ? 'doctor' : 'user',
            message: newMessage.trim()
        };

        // Optimistic UI update (optional, but socket is fast)
        // socket.emit('send_message', messageData); 
        // We rely on 'receive_message' for consistency for now, or we can push locally.

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-[500px] animate-fadeIn">
            {/* Header */}
            <div className="bg-primary dark:bg-blue-600 px-4 py-3 rounded-t-lg flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <MessageSquare size={18} />
                    <span className="font-semibold truncate max-w-[200px]">{receiverName || 'Chat'}</span>
                </div>
                <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 flex flex-col gap-3">
                {loading ? (
                    <div className="flex justify-center items-center h-full text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-xs">
                        <p>No messages yet.</p>
                        <p>Say hello! 👋</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === userData?._id;
                        return (
                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm break-words ${isMe
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none'
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
            <form onSubmit={handleSendMessage} className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border dark:border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-primary text-white p-2 rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
